import OpenAI from "openai";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import boardSchema from "./boardSchema.json" with { type: "json" };
import dotenv from "dotenv";
dotenv.config();

export async function generateAIBoard(userPrompt, boardName, user) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const { _id: userId, account: userAccount } = user

    const skeleton = {
        name: "",
        account: userAccount,
        createdBy: userId,
        activities: [],
        columns: [
            {
                id: "col-item",
                name: "Task",
                width: 450,
                createdAt: 1746961477549,
                createdBy: userId,
                type: { variant: "item" }
            },
            {
                id: "col-status",
                name: "Status",
                width: 140,
                createdAt: 1746961477549,
                createdBy: userId,
                type: {
                    variant: "status",
                    labels: [
                        { id: "stat_inprog", name: "In Progress", color: "grass_green" },
                        { id: "stat_done", name: "Done", color: "done-green" }
                    ]
                }
            },
        ],
        groups: [
            {
                id: "grp-example",
                name: "Example Group",
                color: "teal",
                isCollapsed: false,
                createdAt: 1746961477549,
                createdBy: userId,
                tasks: [
                    {
                        id: "tsk-1",
                        createdAt: 1746961477549,
                        createdBy: userId,
                        columnValues: [
                            { colId: "col-item", value: "Example task A" },
                            { colId: "col-status", value: "stat_inprog" },
                            { colId: "col-date", value: 1746961477549 }
                        ],
                        updates: []
                    },
                    {
                        id: "tsk-2",
                        createdAt: 1746961477549,
                        createdBy: userId,
                        columnValues: [
                            { colId: "col-item", value: "Example task B" },
                            { colId: "col-status", value: "stat_done" },
                            { colId: "col-date", value: 1746961477549 }
                        ],
                        updates: []
                    },
                    {
                        id: "tsk-3",
                        createdAt: 1746961477549,
                        createdBy: userId,
                        columnValues: [
                            { colId: "col-item", value: "Example task C" },
                            { colId: "col-status", value: "stat_inprog" },
                            { colId: "col-date", value: 1746961477549 }
                        ],
                        updates: []
                    }
                ]
            }
        ],
        isStarred: false,
        createdAt: 1746961477549
    };

    const systemPrompt = `
You are an API that produces JSON for a task-management board.
Return ONE object that matches this skeleton (exact keys, no extras):

${JSON.stringify(skeleton, null, 2)}

Rules — strict:
• Add 4–7 additional columns (status|people|date|text|number|file)
• Board must contain 3–5 groups. Each group must contain 3–6 tasks
•  All colours must come from this exact list (copy the token literally, no spaces, no new colours):
  grass_green, done-green, bright-green, saladish, egg_yolk, working_orange, dark-orange,
  peach, sunset, stuck-red, dark-red, sofia_pink, lipstick, bubble, purple, dark_purple,
  berry, dark_indigo, indigo, navy, bright-blue, dark-blue, aquamarine, chili-blue,
  river, winter, explosive, american_gray, blackish, brown, orchid, tan, sky, coffee,
  royal, teal, lavender, steel, lilac, pecan
• All dates must be Unix-epoch milliseconds (e.g. 1746961477549)
• Every "createdBy" field must equal **${userId}**
• The board-level "account" must equal **${userAccount}**
• people / file columns must have NO values in any task
• If a column would be empty for a task, OMIT that columnValue object —
• do not output "", null or 0.
• updates array always []
• Pick label colours that “feel” like the label  
  – e.g. “Done” → *done-green*, “Blocked” → *stuck-red*, “Idea” → *bright-blue*
• Every **status** column must have **≥ 3 labels**  
  – at least one “positive” label should include "isHappyLabel": true
• Fill ONLY the *first two* tasks in the *first group* with status & due-date
  – leave those fields blank in all other tasks
• All due dates must be **after** today (Unix ms)
Return raw JSON only – no markdown fences, no wrapper object
`.trim();

    const { choices } = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]
    });

    const raw = choices[0].message.content

    // Log raw and pretty and answer:
    console.log("%c🟡 Raw JSON string from OpenAI ↓", "color:orange;font-weight:bold")
    console.log(raw);
    try {
        const pretty = JSON.stringify(JSON.parse(raw), null, 2)

    } catch (err) {
        console.warn("Raw output was not valid JSON:", err)
    }

    const board = JSON.parse(raw)


    /* ---------- Validations and formatting of the board" ---------- */

    /* ---------- Fallback: change any un-recognised color to "tan" ---------- */
    const allowedColours = new Set([
        "grass_green", "done-green", "bright-green", "saladish", "egg_yolk",
        "working_orange", "dark-orange", "peach", "sunset", "stuck-red",
        "dark-red", "sofia_pink", "lipstick", "bubble", "purple", "dark_purple",
        "berry", "dark_indigo", "indigo", "navy", "bright-blue", "dark-blue",
        "aquamarine", "chili-blue", "river", "winter", "explosive",
        "american_gray", "blackish", "brown", "orchid", "tan", "sky", "coffee",
        "royal", "teal", "lavender", "steel", "lilac", "pecan"
    ]);

    function fixColour(col) {
        return allowedColours.has(col) ? col : "tan"
    }

    // group colors
    board.groups.forEach(g => {
        g.color = fixColour(g.color)
    });

    // status-label colors
    board.columns.forEach(col => {
        if (col.type.variant === "status" && Array.isArray(col.type.labels)) {
            col.type.labels.forEach(lbl => {
                lbl.color = fixColour(lbl.color)
            });
        }
    });
    /* ----------------------------------------------------------------------- */


    //build board basic info + createdby:
    board.name = boardName
    board.account = userAccount
    board.createdBy = userId
    board.createdAt = Date.now()

    board.columns.forEach(c => (c.createdBy = userId));
    board.groups.forEach(g => {
        g.createdBy = userId
        g.tasks.forEach(t => (t.createdBy = userId));
    });

    /*  Remove blank columnValues (validation) ░ */
    board.groups.forEach(g =>
        g.tasks.forEach(t => {
            t.columnValues = t.columnValues.filter(v =>
                v.value !== "" && v.value !== null && v.value !== undefined
            )
        })
    )

    /* Strip status/date values from tasks after the first two in the first group */
    const firstGroup = board.groups[0];
    firstGroup.tasks.slice(2).forEach(t => {
        t.columnValues = t.columnValues.filter(v =>
            !["col-status", "col-date"].includes(v.colId)
        );
    });

    /*  Validate ░ */
    const ajv = new Ajv({ allErrors: true, strict: false })
    addFormats(ajv)
    const validate = ajv.compile(boardSchema)
    if (!validate(board)) {
        console.error(validate.errors)
        throw new Error("🛑 Generated board failed schema validation")
    }

    /*  Domain checks: item value present & people/file empty ░ */
    const colVariant = Object.fromEntries(board.columns.map(c => [c.id, c.type.variant]))
    board.groups.forEach(g =>
        g.tasks.forEach(t => {
            if (!t.columnValues.some(v => v.colId === "col-item" && typeof v.value === "string" && v.value.trim()))
                throw new Error(`Task ${t.id} missing 'item' value`);

            t.columnValues.forEach(v => {
                if (["people", "file"].includes(colVariant[v.colId]) && v.value !== "")
                    throw new Error(`Task ${t.id} must not have value for ${colVariant[v.colId]} column ${v.colId}`)
            });
        })
    );

    console.log("✅ board:", board)
    return board
}
