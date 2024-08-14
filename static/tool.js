$(function () {
    function executeTool(tool, input) {
        switch (tool) {
            case "weather":
                simulateWeatherTool(input);
                break;
            case "calculator":
                simulateCalculatorTool(input);
                break;
            default:
                addMessage(`System: Unknown tool "${tool}"`, "system-message");
        }
    }

    function simulateWeatherTool(input) {
        addMessage("Weather Tool: Fetching weather data...", "tool-message");
        setTimeout(() => {
            const weather = ["sunny", "rainy", "cloudy"][
                Math.floor(Math.random() * 3)
            ];
            const toolResponse = `The weather in ${input} is ${weather}.`;
            addMessage("Weather Tool: " + toolResponse, "tool-message");
            callGroqAPIForTool(
                'The weather tool returned: "' +
                    toolResponse +
                    '". Please provide a human-friendly response based on this information.'
            );
        }, 1000);
    }

    function simulateCalculatorTool(input) {
        addMessage(
            "Calculator Tool: Performing calculation...",
            "tool-message"
        );
        setTimeout(() => {
            try {
                const result = eval(input); // Note: eval is used for simplicity here. In a real application, use a safer method to evaluate mathematical expressions.
                const toolResponse = `The result of ${input} is ${result}.`;
                addMessage("Calculator Tool: " + toolResponse, "tool-message");
                callGroqAPI(
                    'The calculator tool returned: "' +
                        toolResponse +
                        '". Please provide a human-friendly response based on this calculation.'
                );
            } catch (e) {
                addMessage(
                    "Calculator Tool: Error in calculation.",
                    "tool-message"
                );
                callGroqAPI(
                    "The calculator tool encountered an error. Please inform the user and ask if they want to try a different calculation."
                );
            }
        }, 1000);
    }

    window.AJ_Util.Tool.executeTool = executeTool;
    window.AJ_Util.Tool.simulateWeatherTool = simulateWeatherTool;
    window.AJ_Util.Tool.simulateCalculatorTool = simulateCalculatorTool;
});
