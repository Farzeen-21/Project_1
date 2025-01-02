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

        onApprove: function (oEvent) {
            
            // var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appId = 'com.ibspl.leaveapproval';
            var appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);

            rowObj = oEvent.getObject();

            if (!this.oApproveDialog) {
                this.oApproveDialog = new Dialog({
                    title: "Approve",
                    type: DialogType.Message,
                    content: [
                        new Label({
                            text: "Do you want to approve this request?",
                            labelFor: "approveNote"
                        }),
                        new TextArea("approveNote", {
                            width: "100%",
                            placeholder: "Add note (optional)"
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Approve",
                        press: function () {
                            
                            var sText = sap.ui.getCore().byId("approveNote").getValue();
                            this.oApproveDialog.close();

                            var obj = {
                                "action": "APPROVE",
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
                                    
                                    sap.ui.getCore().byId("approveNote").setValue("");
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
                            this.oApproveDialog.close();
                        }.bind(this)
                    })
                });
            }

            this.oApproveDialog.open();
        }
    };
});
