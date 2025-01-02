sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Label",
    "sap/m/TextArea",
    "sap/m/Button",
    "sap/m/BusyIndicator"

], function (MessageToast, MessageBox, JSONModel, Dialog, mobileLibrary, Label, TextArea, Button, BusyIndicator) {
    'use strict';
    var appModulePath;
    var rowObj;
    var DialogType = mobileLibrary.DialogType;
    var ButtonType = mobileLibrary.ButtonType;

    return {
        onReject: function (oEvent) {
            
            var appId = 'com.ibspl.leaveapproval';
            var appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);

            rowObj = oEvent.getObject();

            if (!this.oRejectDialog) {
                this.oRejectDialog = new Dialog({
                    title: "Reject",
                    type: DialogType.Message,
                    content: [
                        new Label({
                            text: "Do you want to reject this request?",
                            labelFor: "rejectNote"
                        }),
                        new TextArea("rejectNote", {
                            width: "100%",
                            placeholder: "Add note (required)",
                            liveChange: function (oEvent) {
                                
                                var sText = oEvent.getParameter("value");
                                this.oRejectDialog.getBeginButton().setEnabled(sText.length > 0);
                            }.bind(this)
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Reject",
                        enabled: false,
                        press: function () {
                            
                            var sText = sap.ui.getCore().byId("rejectNote").getValue();
                            this.oRejectDialog.close();

                            var obj = {
                                "action": "REJECT",
                                "teamLeaveInfo": [{
                                    "LEAVE_ID": rowObj.LEAVE_ID,
                                    "EMPLOYEE_ID": rowObj.EMPLOYEE_ID
                                }],
                                "leaveEvents": [{
                                    "LEAVE_ID": rowObj.LEAVE_ID,
                                    "EVENT_NO": 1,//hardcode
                                    "EVENT_CODE": "APR",
                                    "USER_ID": sap.ui.getCore().getModel("userAttriJson").getProperty("/EMAIL_ID"),
                                    "USER_NAME": sap.ui.getCore().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME"),
                                    "REMARK": "Leave Request Approved by Team Lead",
                                    "COMMENT": sText,
                                    "CREATED_ON": new Date()
                                }]
                            };
                            var data = JSON.stringify(obj);
                            var path = appModulePath + "/odata/v4/team-leave-planner/TeamLeaveApproval";

                            $.ajax({
                                url: path,
                                type: 'POST',
                                data: data,
                                contentType: 'application/json',
                                success: function (oData, response) {
                                    
                                    sap.ui.getCore().byId("rejectNote").setValue("");
                                    var msg = oData.value[0];
                                    MessageBox.success(oData.value[0]);
                                },
                                error: function (oError) {
                                    
                                    context.reuseError(oError);
                                }
                            });
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oRejectDialog.close();
                        }.bind(this)
                    })
                });
            }

            this.oRejectDialog.open();
        }
    };
});
