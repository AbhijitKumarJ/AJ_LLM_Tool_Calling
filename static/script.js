$(function () {
    function sendMessage() {
        const userInput = $("#userInput");
        const userMessage = userInput.val().trim();

        if (userMessage === "") return;

        addMessage(userMessage, "user-message");
        userInput.val("");

        if(window.AJ_Util.UI.isTool)
        {
            window.AJ_Util.API.callGroqAPIForTool(userMessage);
        }
        else
        {
            window.AJ_Util.API.callGroqAPI(userMessage);
        }
    }

    function updateContext(role, content) {
        window.AJ_Util.Context.push({role:role, content:content});
    }

    function addMessage(content, className) {
        $("#chatMessages")
            .append($("<div>").addClass(`message ${className}`).html(content))
            .scrollTop($("#chatMessages")[0].scrollHeight);
    }

    function addStep(step) {
        var content="intent_category : " + step.intent_category + "<br>" +
                "intent_sub_category : " + step.intent_sub_category + "<br>" + 
                "intent_label : " + step.intent_label + "<br>" + 
                "intent_description : " + step.intent_description + "<br>" + 
                "intent_parameters : " + JSON.stringify(step.intent_parameters) + "<br>" + 
                "intent_response : " + step.intent_sub_category + "<br>" + 
                "is_tool_usage_required : " + step.is_tool_usage_required + "<br>" +
                "<input type='hidden' value='"+ JSON.stringify(step) +"'>" + 
                "<button onclick=\"window.AJ_Util.UI.addToSelectedTasks(this)\">Add to selected tasks</button>"

        $("#chatMessages")
            .append($("<div>").addClass(`message bot-message`).html(content))
            .scrollTop($("#chatMessages")[0].scrollHeight);
    }

    var selectedTasks=[];

    function addToSelectedTasks(btn)
    {
        selectedTasks.push($(btn).closest('div').html());
        $('#divSelectedTasks').append($(btn).closest('div').html() + "<br></br>");
    }


    function applyCorrection() {
        const correctedText = $("#correctionText").val();
        try {
            const correctedJson = JSON.parse(correctedText);
            addMessage("Correction applied successfully", "bot-message");
            window.AJ_Util.API.handleGroqResponse({
                choices: [
                    {
                        message: {
                            content: JSON.stringify(correctedJson, null, 2),
                        },
                    },
                ],
            });
        } catch (error) {
            addMessage(
                `Error in JSON correction: ${error.message}`,
                "bot-message error-message"
            );
        }
    }

    $("#sendButton").click(sendMessage);
    $("#userInput").keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            e.preventDefault();
            sendMessage();
        }
    });
    $("#applyCorrection").click(applyCorrection);

    window.AJ_Util.UI.addStep=addStep;
    window.AJ_Util.UI.selectedTasks=selectedTasks;
    window.AJ_Util.UI.addToSelectedTasks=addToSelectedTasks;
    window.AJ_Util.UI.isTool=false;
    window.AJ_Util.UI.sendMessage = sendMessage;
    window.AJ_Util.UI.addMessage = addMessage;
    window.AJ_Util.UI.applyCorrection = applyCorrection;
});
