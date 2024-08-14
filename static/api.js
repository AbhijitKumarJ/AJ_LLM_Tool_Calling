$(function () {
    function callGroqAPI(userMessage) {
        $.ajax({
            url: window.AJ_Util.GROQ_API_URL,
            type: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.AJ_Util.GROQ_API_KEY}`,
            },
            data: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert in understanding user intension and can break it down as one or more tasks with parameters associated with it. Try to respond with the array of task object in json format. Where each task has intent_category, intent_sub_category, intent_label, intent_description, intent_parameters, intent_response, is_tool_usage_required fields. Create one object for each intent and put all intents in an array in json format. Don't generate any extra text other than json. Strict to the format given here.",
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                response_format: {
                    type: "json_object",
                },
                stop: null,
            }),
            success: function (response) {
                handleGroqResponse(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(
                    "Error calling Groq API:",
                    textStatus,
                    errorThrown
                );
                window.AJ_Util.UI.addMessage(`Error: ${textStatus}`, "bot-message error-message");
                if (jqXHR.responseText) {
                    const errorResponse = JSON.parse(jqXHR.responseText);
                    if (
                        errorResponse.error &&
                        errorResponse.error.failed_generation
                    ) {
                        $("#correctionText").val(
                            errorResponse.error.failed_generation
                        );
                    } else {
                        $("#correctionText").val(jqXHR.responseText);
                    }
                }
            },
        });
    }

    function handleGroqResponse(response) {
        if (response.choices && response.choices.length > 0) {
            const content = response.choices[0].message.content;
            window.AJ_Util.UI.addMessage(content, "bot-message");
            $("#correctionText").val(content);
            setTimeout(function(){executeSteps(content);}, 1000);
        } else {
            window.AJ_Util.UI.addMessage(
                "Received an empty response from the API.",
                "bot-message error-message"
            );
        }
    }

    function executeSteps(content)
    {
        var steps=JSON.parse(content);
        // steps=[ 
        //     { 
        //         "intent_category": "Development", 
        //         "intent_sub_category": "Web Development", 
        //         "intent_label": "Create a website for snake game", 
        //         "intent_description": "Develop a website to play snake game", 
        //         "intent_parameters": { 
        //             "game_type": "snake", 
        //             "game_features": "multiplayer, scoring, high score tracking", 
        //             "website_platform": "HTML, CSS, JavaScript", 
        //             "database": "MySQL, MongoDB" 
        //         }, 
        //         "intent_response": "Design the website layout, implement game logic using JavaScript, and integrate database for storing high scores.", 
        //         "is_tool_usage_required": true 
        //     }, 
        //     { 
        //         "intent_category": "Development", 
        //         "intent_sub_category": "Game Development", 
        //         "intent_label": "Design game logic for snake game", 
        //         "intent_description": "Implement game logic for snake game", 
        //         "intent_parameters": { 
        //             "game_features": "snake movement, collision detection, scoring", 
        //             "game_difficulty": "easy, medium, hard" 
        //         }, 
        //         "intent_response": "Use JavaScript to create game loop, implement snake movement and collision detection, and add scoring system.", 
        //         "is_tool_usage_required": false 
        //     }, 
        //     { 
        //         "intent_category": "Development", 
        //         "intent_sub_category": "Web Development", 
        //         "intent_label": "Implement multiplayer feature for snake game", 
        //         "intent_description": "Implement multiplayer feature for snake game", 
        //         "intent_parameters": { 
        //             "game_type": "snake", 
        //             "game_features": "multiplayer, real-time updates" 
        //         }, 
        //         "intent_response": "Use WebSockets to establish real-time communication between players, and implement game state synchronization.", 
        //         "is_tool_usage_required": true 
        //     }, 
        //     { "intent_category": "Development", "intent_sub_category": "Testing", "intent_label": "Test snake game website", "intent_description": "Test snake game website", "intent_parameters": { "test_cases": "game logic, user interface, multiplayer feature" }, "intent_response": "Test game logic, user interface, and multiplayer feature to ensure website is functioning as expected.", "is_tool_usage_required": false } ];

        for (let index = 0; index < steps.length; index++) {
            const step = steps[index];
            window.AJ_Util.UI.addStep(step);
        }
    }

    function callGroqAPIForTool(userMessage) {
        const messages = [
            {
                role: "system",
                content:
                    'You are an AI assistant capable of using tools. When a user asks a question that requires external data or computation, use the appropriate tool by outputting a JSON object with the following structure: {"tool": "tool_name", "input": "tool_input"}. Available tools are: \'weather\' and \'calculator\'.',
            },
            { role: "user", content: userMessage },
        ];

        $.ajax({
            url: window.AJ_Util.GROQ_API_URL,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.AJ_Util.GROQ_API_KEY}`,
            },
            data: JSON.stringify({
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                response_format: {
                    type: "json_object",
                },
                messages: messages,
            }),
            success: function (response) {
                handleGroqResponseForTool(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                window.AJ_Util.UI.addMessage(`Error: ${textStatus}`, "system-message");
                console.error("Error calling Groq API:", jqXHR.responseText);
            },
        });
    }

    function handleGroqResponseForTool(response) {
        if (response.choices && response.choices.length > 0) {
            const content = response.choices[0].message.content;
            window.AJ_Util.UI.addMessage("System: " + content, "system-message");

            // Check if the response contains a tool call
            try {
                const toolCall = JSON.parse(content);
                if (toolCall.tool && toolCall.input) {
                    window.AJ_Util.Tool.executeTool(toolCall.tool, toolCall.input);
                }
            } catch (e) {
                // Not a JSON object, so no tool call
            }
        } else {
            window.AJ_Util.UI.addMessage(
                "System: Received an empty response from the API.",
                "system-message"
            );
        }
    }

    window.AJ_Util.API.callGroqAPI = callGroqAPI;
    window.AJ_Util.API.handleGroqResponse = handleGroqResponse;
    window.AJ_Util.API.callGroqAPIForTool = callGroqAPIForTool;
    window.AJ_Util.API.handleGroqResponseForTool = handleGroqResponseForTool;
});
