sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "sap/ui/unified/library",
    "sap/ui/core/library",
    "sap/m/library",
    "com/ibspl/leavemgmt2/model/formatter",
    "sap/ui/Device",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/TextArea",
    "sap/m/Button",
    "sap/ui/core/date/UI5Date"

], (Controller, JSONModel, MessageBox, Fragment, BusyIndicator, unifiedLibrary, coreLibrary, mobileLibrary,
    formatter, Device, Dialog, Label, TextArea, Button, UI5Date) => {
    "use strict";
    var that;
    var context;
    var appModulePath;
    var rowObj;
    var approveObj;
    var rejectObj;
    var DialogType = mobileLibrary.DialogType;
    var ButtonType = mobileLibrary.ButtonType;

    var CalendarDayType = unifiedLibrary.CalendarDayType;
    var StickyMode = mobileLibrary.PlanningCalendarStickyMode;

    return Controller.extend("com.ibspl.leavemgmt2.controller.Master", {

        formatter: formatter,

        onInit() {

            that = this;
            context = this;
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);

            var oModel = new JSONModel({
                leaveType: "",
                lDate: "",
                lastDateVisible: false,
                fDate: "",
                tDate: "",
                days: 0,
                reason: "",
                minDate: new Date(),
                UI5Date: UI5Date.getInstance("2025", "0", "28"),
                tableForRequester: false,
                tableForApprover: false,
                calendarForRequester: false,
                calendarForApprover: false,
                halfType: false,
                key: "teams",
                key1: "teams"
            });
            context.getOwnerComponent().setModel(oModel, "formModel");
            BusyIndicator.show(0);
            this.onAdd();
            this.getUserAttribute();
        },

        onAppointmentSelect: function (oEvent) {

            var oAppointment = oEvent.getParameter("appointment"),
                sSelected;
            if (oAppointment) {
                sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC").getSelectedAppointments().length);
            } else {
                var aAppointments = oEvent.getParameter("appointments");
                var sValue = aAppointments.length + " Appointments selected";
                MessageBox.show(sValue);
            }
        },

        handleSelectionFinish: function (oEvent) {

            var aSelectedKeys = oEvent.getSource().getSelectedKeys();
            this.byId("PC").setBuiltInViews(aSelectedKeys);
        },

        onCalendarTypeSelect: function (oEvent) {

            this.byId("PC").setPrimaryCalendarType(oEvent.getParameters().selectedItem.getKey());
        },

        onCalendarSecondaryTypeSelect: function (oEvent) {

            var sKey = oEvent.getParameters().selectedItem.getKey();
            if (sKey === "None") {
                this.byId("PC").setSecondaryCalendarType(undefined);
            } else {
                this.byId("PC").setSecondaryCalendarType(sKey);
            }
        },

        handleRowHeaderPress: function (oEvent) {

            MessageBox.show("rowHeaderPressed on row: " + oEvent.getParameter("row").getId());
        },

        onAdd: function (sValue) {

            var dynamicSideContentState = this.getView().byId("idDynamicSideContent").getShowSideContent();
            if (dynamicSideContentState === true) {
                this.getView().byId("idDynamicSideContent").setShowSideContent(false);
                this.getView().byId("idDynamicSideContent").setShowMainContent(true);
                this.byId("PC").setBuiltInViews(['OneMonth']);
            } else {
                this.getView().byId("idDynamicSideContent").setShowSideContent(true);
                this.byId("PC").setBuiltInViews(['Week']);
                if (Device.system.phone === true) {
                    this.getView().byId("idDynamicSideContent").setShowMainContent(false);
                }
            }

            // if (sValue === 'Close') {
            this.onRefresh();
            // }
        },

        onSelectionChange: function (oEvent) {
            
            var sKey = oEvent.getSource().getSelectedKey();
            context.getOwnerComponent().getModel("formModel").setProperty("/leaveType", sKey);
            context.getOwnerComponent().getModel("formModel").setProperty("/lDate", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
            context.getOwnerComponent().getModel("formModel").setProperty("/reason", "");
            context.getView().byId("idText").setText("100 characters remaining");

            context.getView().byId("idCombo").setValueState("None");
            context.getView().byId("idLWDate").setValueState("None");
            context.getView().byId("idFDate").setValueState("None");
            context.getView().byId("idTDate").setValueState("None");
            context.getView().byId("idReason").setValueState("None");
            context.getView().byId("idHalf").setValue("");

            if (sKey === 'BA' || sKey === 'CL_HALF_DAY' || sKey === 'GL_HALF_DAY') {
                context.getOwnerComponent().getModel("formModel").setProperty("/halfType", true);
                context.getView().byId("idTDate").setEditable(false);
            } else {
                context.getOwnerComponent().getModel("formModel").setProperty("/halfType", false);
                context.getView().byId("idTDate").setEditable(true);
            }

            if (sKey === 'CO') {
                context.getOwnerComponent().getModel("formModel").setProperty("/lastDateVisible", true);
                // context.getOwnerComponent().getModel("formModel").setProperty("/minDate", null);
            } else {
                context.getOwnerComponent().getModel("formModel").setProperty("/lastDateVisible", false);
                // context.getOwnerComponent().getModel("formModel").setProperty("/minDate", new Date());
            }
        },

        onRefresh: function (oEvent) {

            context.getOwnerComponent().getModel("formModel").setProperty("/leaveType", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/lDate", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
            context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
            context.getOwnerComponent().getModel("formModel").setProperty("/reason", "");

            context.getView().byId("idCombo").setValueState("None");
            context.getView().byId("idLWDate").setValueState("None");
            context.getView().byId("idFDate").setValueState("None");
            context.getView().byId("idTDate").setValueState("None");
            context.getView().byId("idReason").setValueState("None");
            context.getView().byId("idHalf").setValue("");

            context.getOwnerComponent().getModel("formModel").setProperty("/halfType", false);
            context.getView().byId("idTDate").setEditable(true);
            context.getOwnerComponent().getModel("formModel").setProperty("/lastDateVisible", false);

            context.getOwnerComponent().getModel("formModel").refresh(true);
            context.getView().byId("idCombo").setSelectedKey("");
            context.getView().byId("idCombo").setValue("");
            context.getView().byId("idHalf").setValue("");
        },

        onSelectionChangeOfHalf: function (oEvent) {
            
            var sKey = oEvent.getSource().getSelectedKey();
            var fromDate = context.getOwnerComponent().getModel("formModel").getProperty("/fDate");
            var toDate = context.getOwnerComponent().getModel("formModel").getProperty("/tDate");
            if (sKey === 'First_Half') {
                fromDate.setHours("9");
                fromDate.setMinutes("00");
                fromDate.toISOString();
                fromDate = new Date(fromDate);
                toDate.setHours("13");
                toDate.setMinutes("00");
            } else if (sKey === 'Second_Half') {
                fromDate.setHours("14");
                fromDate.setMinutes("00");
                fromDate.toISOString();
                fromDate = new Date(fromDate);
                toDate.setHours("18");
                toDate.setMinutes("00");
            }
            context.getOwnerComponent().getModel("formModel").setProperty("/fDate", fromDate);
            context.getOwnerComponent().getModel("formModel").setProperty("/tDate", toDate);
        },

        onReasonChange: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            context.getOwnerComponent().getModel("formModel").setProperty("/reason", sValue);
            if (sValue !== "") {
                var length = sValue.length;
                length = 100 - length;
                context.getView().byId("idText").setText(length + " characters remaining");
                context.getView().byId("idReason").setValueState("None");
            } else {
                context.getView().byId("idText").setText("100 characters remaining");
            }
        },

        onLDate: function (oEvent) {
            
            var sLWDate = oEvent.getSource().getDateValue();
            var leaveData = context.getOwnerComponent().getModel("tableData").getData().value;

            const isDateInRange = leaveData.some(leave => {
                const startDate = new Date(leave.START_DATE);
                const endDate = new Date(leave.END_DATE);
                return sLWDate >= startDate && sLWDate <= endDate;
            });

            if (isDateInRange) {
                oEvent.getSource().setValue("");
                oEvent.getSource().setValueState("Error").setValueStateText("Leave already applied for this date.");
                context.getOwnerComponent().getModel("formModel").setProperty("/lDate", "");
                context.getView().byId("idReason").setValue("");
                return;
            } else {
                context.getOwnerComponent().getModel("formModel").setProperty("/lDate", sLWDate);
                context.getView().byId("idLWDate").setValueState("None");
                var sDate = oEvent.getParameter("value");
                context.getView().byId("idReason").setValue("Compensatory Date:- " + sDate + "\n" + "Note: ");

                var length = context.getView().byId("idReason").getValue().length;
                length = 100 - length;
                context.getView().byId("idText").setText(length + " characters remaining");
            }
        },

        onFDate: function (oEvent) {
            
            var sFDate = oEvent.getSource().getDateValue();
            var leaveData = context.getOwnerComponent().getModel("tableData").getData().value;

            const isDateInRange = leaveData.some(leave => {
                const startDate = new Date(leave.START_DATE);
                const endDate = new Date(leave.END_DATE);
                if (startDate.getHours() === 9 || startDate.getHours() === 14) {
                    startDate.setHours(0);
                }
                return sFDate >= startDate && sFDate <= endDate;
            });

            if (isDateInRange) {
                oEvent.getSource().setValue("");
                oEvent.getSource().setValueState("Error").setValueStateText("Leave already applied for this date.");
                context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
                return;
            }

            if (context.getView().byId("idCombo").getSelectedKey() !== 'ML') {
                if (sFDate.getDay() === 0 || sFDate.getDay() === 6) {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueState("Error").setValueStateText("Cannot pick weekend date!");
                    context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
                    return;
                } else {
                    var sToDate = sFDate;
                    sToDate.toISOString();
                    sToDate = new Date(sToDate);
                    sToDate.setHours('23');
                    sToDate.setMinutes('59');
                    context.getOwnerComponent().getModel("formModel").setProperty("/fDate", sFDate);
                    context.getOwnerComponent().getModel("formModel").setProperty("/tDate", sToDate);
                    context.getView().byId("idFDate").setValueState("None");
                    context.getView().byId("idTDate").setValueState("None");
                }
            }
            else if (context.getView().byId("idCombo").getSelectedKey() === 'ML') {
                if (sFDate.getDay() === 0 || sFDate.getDay() === 6) {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueState("Error").setValueStateText("Cannot pick weekend date!");
                    context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
                    return;
                } else {
                    context.getOwnerComponent().getModel("formModel").setProperty("/fDate", sFDate);
                    var resultDate = new Date(sFDate);
                    resultDate.setDate(resultDate.getDate() + 180);
                    resultDate.setHours('23');
                    resultDate.setMinutes('59');
                    resultDate = new Date(resultDate);
                    context.getOwnerComponent().getModel("formModel").setProperty("/tDate", resultDate);
                    context.getView().byId("idFDate").setValueState("None");
                    context.getView().byId("idTDate").setValueState("None");
                }
            }
            else {
                var sToDate = sFDate;
                sToDate.toISOString();
                sToDate = new Date(sToDate);
                sToDate.setHours('23');
                sToDate.setMinutes('59');
                context.getOwnerComponent().getModel("formModel").setProperty("/fDate", sFDate);
                context.getOwnerComponent().getModel("formModel").setProperty("/tDate", sToDate);
                context.getView().byId("idFDate").setValueState("None");
                context.getView().byId("idTDate").setValueState("None");
            }

            if (this.byId("idCombo").getSelectedKey() === 'CL_HALF_DAY' || this.byId("idCombo").getSelectedKey() === 'BA' ||
                this.byId("idCombo").getSelectedKey() === 'GL_HALF_DAY') {
                context.getOwnerComponent().getModel("formModel").setProperty("/days", 0.5);
            } else if (this.byId("idCombo").getSelectedKey() === 'ML') {
                context.getOwnerComponent().getModel("formModel").setProperty("/days", 180);
            } else {
                context.getOwnerComponent().getModel("formModel").setProperty("/days", 1);
            }
        },

        onTDate: function (oEvent) {
            
            var sTDate = oEvent.getSource().getDateValue();
            sTDate.setHours('23');
            sTDate.setMinutes('59');
            context.getOwnerComponent().getModel("formModel").setProperty("/tDate", sTDate);
            if (context.getOwnerComponent().getModel("formModel").getProperty("/fDate") !== "") {
                var date1 = context.getOwnerComponent().getModel("formModel").getProperty("/fDate");
                var tempDate = date1;
                tempDate = tempDate.toISOString();
                tempDate = new Date(tempDate);
                var date2 = context.getOwnerComponent().getModel("formModel").getProperty("/tDate");
                var count = 0;
                while (tempDate <= date2) {
                    var day = tempDate.getDay();
                    if (day !== 0 && day !== 6) {
                        count++;
                    } else if (context.getView().byId("idCombo").getSelectedKey() === 'CO') {
                        count++;
                    }
                    tempDate.setDate(tempDate.getDate() + 1);
                }
                context.getOwnerComponent().getModel("formModel").setProperty("/days", count);

                var sKey = context.getView().byId("idCombo").getSelectedKey();
                if (sKey === 'GL') {
                    var GL = context.getOwnerComponent().getModel("userAttriJson").getProperty("/GENERAL_LEAVE_BALANCE");
                    GL = Number(GL);
                    if (count > GL) {
                        oEvent.getSource().setValue("");
                        oEvent.getSource().setValueState("Error").setValueStateText("GL balance is low");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                        return;
                    }
                }

                if (sKey === 'CL') {
                    var CL = context.getOwnerComponent().getModel("userAttriJson").getProperty("/CASUAL_LEAVE_BALANCE");
                    CL = Number(CL);
                    if (count > CL) {
                        oEvent.getSource().setValue("");
                        oEvent.getSource().setValueState("Error").setValueStateText("CL balance is low");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                        return;
                    }
                }

                if (date1 > date2) {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueState("Error").setValueStateText("To Date cannot be lesser than From Date");
                    context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                } else if (date2.getDay() === 0 || date2.getDay() === 6) {
                    if (context.getView().byId("idCombo").getSelectedKey() !== 'CO') {
                        oEvent.getSource().setValue("");
                        oEvent.getSource().setValueState("Error").setValueStateText("Cannot pick weekend date!");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                    }
                } else {
                    oEvent.getSource().setValueState("None");
                }
            } else if (context.getOwnerComponent().getModel("formModel").getProperty("/fDate") === "") {
                oEvent.getSource().setValue("");
                oEvent.getSource().setValueState("Error").setValueStateText("Select From Date first");
                context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
            }
        },

        onPress: function () {

            var sLeaveType = context.getOwnerComponent().getModel("formModel").getProperty("/leaveType");
            var sfDate = context.getOwnerComponent().getModel("formModel").getProperty("/fDate");
            var tDate = context.getOwnerComponent().getModel("formModel").getProperty("/tDate");
            var sdays = context.getOwnerComponent().getModel("formModel").getProperty("/days");
            var sreason = context.getOwnerComponent().getModel("formModel").getProperty("/reason");
            if (sLeaveType === "" || sLeaveType === null) {
                context.getView().byId("idCombo").setValueState("Error").setValueStateText("Please select Leave Type");
            }
            if (sfDate === "" || sfDate === null) {
                context.getView().byId("idFDate").setValueState("Error").setValueStateText("Please select Date");
            }
            if (tDate === "" || tDate === null) {
                context.getView().byId("idTDate").setValueState("Error").setValueStateText("Please select Date");
            }
            if (sreason === "" || sreason === null) {
                context.getView().byId("idReason").setValueState("Error").setValueStateText("Please write reason");
            }

            if (sLeaveType !== "" && sfDate !== "" && tDate !== "" && sreason !== "") {
                MessageBox.confirm("Do you want to submit the leave request?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction, oEvent) {
                        if (oAction === "YES") {

                            var path = appModulePath + "/odata/v4/team-leave-planner/TeamLeaveAction";
                            var fromDate = context.getOwnerComponent().getModel("formModel").getProperty("/fDate");
                            fromDate = fromDate.toISOString().split(".")[0];
                            var toDate = context.getOwnerComponent().getModel("formModel").getProperty("/tDate");
                            toDate = toDate.toISOString().split(".")[0];

                            var obj = {
                                "sAction": "CREATE",
                                "aLeaveRequestInfo": [{
                                    "LEAVE_ID": 1,//hardcode
                                    "EMPLOYEE_ID": context.getOwnerComponent().getModel("userAttriJson").getData().EMPLOYEE_ID,
                                    "LEAVE_TYPE": context.getOwnerComponent().getModel("formModel").getProperty("/leaveType"),
                                    "NO_OF_LEAVES": context.getOwnerComponent().getModel("formModel").getProperty("/days"),
                                    "START_DATE": fromDate,
                                    "END_DATE": toDate,
                                    "LEAVE_STATUS": 1,
                                    "LEAVE_NOTES": context.getOwnerComponent().getModel("formModel").getProperty("/reason"),
                                    "IS_DELETED": null
                                }],
                                "aLeaveEventLog": [{
                                    "LEAVE_ID": 1,//hardcode
                                    "EVENT_NO": 1,//hardcode
                                    "EVENT_CODE": "CR",
                                    "USER_ID": context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"),
                                    "USER_NAME": context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME"),
                                    "REMARK": "Leave Request Created",//hardcode
                                    "COMMENT": context.getOwnerComponent().getModel("formModel").getProperty("/reason"),
                                    "CREATED_ON": new Date()
                                }]
                            };

                            var data = JSON.stringify(obj);
                            BusyIndicator.show(0);
                            $.ajax({
                                url: path,
                                type: 'POST',
                                data: data,
                                contentType: 'application/json',
                                success: function (oData, response) {
                                    var msg = oData.value;
                                    context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                                    context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"), msg);
                                },
                                error: function (oError) {
                                    context.reuseError(oError);
                                }
                            });
                        }
                    }
                });
            }
        },

        onDelete: function (oEvent) {
            rowObj = oEvent.getSource().getBindingContext("tableData").getObject();
            MessageBox.confirm("Do you want to delete the leave request?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction, oEvent) {
                    if (oAction === "YES") {

                        var path = appModulePath + "/odata/v4/team-leave-planner/TeamLeaveAction";

                        var payload = {
                            "sAction": "DELETE",
                            "aLeaveRequestInfo": [{
                                "LEAVE_ID": rowObj.LEAVE_ID,
                                "EMPLOYEE_ID": rowObj.EMPLOYEE_ID
                            }],
                            "aLeaveEventLog": [{
                                "LEAVE_ID": rowObj.LEAVE_ID,
                                "EVENT_NO": 1,//hardcode
                                "EVENT_CODE": "DL",
                                "USER_ID": context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"),
                                "USER_NAME": context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME"),
                                "REMARK": "Leave Request Deleted",
                                "COMMENT": "Leave request deleted by employee id : " + rowObj.EMPLOYEE_ID,
                                "CREATED_ON": new Date()
                            }]
                        };
                        var data = JSON.stringify(payload);
                        BusyIndicator.show(0);
                        $.ajax({
                            url: path,
                            type: 'POST',
                            data: data,
                            contentType: 'application/json',
                            success: function (oData, response) {

                                var msg = oData.value;
                                context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"), msg);
                            },
                            error: function (oError) {
                                context.reuseError(oError);
                            }
                        });
                    }
                }
            });
        },

        singleAppointmentSelect: function (oEvent) {

            var oButton = oEvent.getSource();
            var soAppointment = oEvent.getParameter("appointment"),
                oView = this.getView();

            var obj = soAppointment.mProperties;
            var oModel5 = new JSONModel();
            oModel5.setData(obj);
            oView.setModel(oModel5, "singleAppointDetail")

            if (soAppointment === undefined) {
                return;
            }

            if (!soAppointment.getSelected() && this._pDetailsPopover2) {
                this._pDetailsPopover2.then(function (oResponsivePopover2) {
                    oResponsivePopover2.close();
                });
                return;
            }

            if (!this._pDetailsPopover2) {
                this._pDetailsPopover2 = Fragment.load({
                    id: oView.getId(),
                    name: "com.ibspl.leavemgmt2.view.fragments.Details2",
                    controller: this
                }).then(function (oResponsivePopover2) {
                    oView.addDependent(oResponsivePopover2);
                    oResponsivePopover2.bindElement("/singleAppointDetail");
                    return oResponsivePopover2;
                });
            }
            this._pDetailsPopover2.then(function (oResponsivePopover2) {
                oResponsivePopover2.openBy(soAppointment);
            });
        },

        handleAppointmentSelect: function (oEvent) {

            var oButton = oEvent.getSource();
            var oAppointment = oEvent.getParameter("appointment"),
                oView = this.getView();

            var obj = oAppointment.mProperties;
            var oModel5 = new JSONModel();
            oModel5.setData(obj);
            oView.setModel(oModel5, "AppointDetail")

            if (oAppointment === undefined) {
                return;
            }

            if (!oAppointment.getSelected() && this._pDetailsPopover) {
                this._pDetailsPopover.then(function (oResponsivePopover) {
                    oResponsivePopover.close();
                });
                return;
            }

            if (!this._pDetailsPopover) {
                this._pDetailsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.ibspl.leavemgmt2.view.fragments.Details",
                    controller: this
                }).then(function (oResponsivePopover) {
                    oView.addDependent(oResponsivePopover);
                    oResponsivePopover.bindElement("/AppointDetail");
                    return oResponsivePopover;
                });
            }
            this._pDetailsPopover.then(function (oResponsivePopover) {
                oResponsivePopover.openBy(oAppointment);
            });
        },

        handlePopoverCloseButton: function (oEvent) {
            this.byId("detailsPopover").close();
        },

        onLink: function (oEvent) {
           
            var obj = oEvent.getSource().getBindingContext("TeamsData").getObject();
            context.getOwnerComponent().getModel("formModel").setProperty("/CL_LeaveBalance", obj.CASUAL_LEAVE_BALANCE);
            context.getOwnerComponent().getModel("formModel").setProperty("/GL_LeaveBalance", obj.GENERAL_LEAVE_BALANCE);

            var oArray = obj.EmployeeProjectDetail;
            var result = oArray.map(item => item.DESCRIPTION).join(", ");
            console.log(result); // Output: "iVen, Crompton"
            context.getOwnerComponent().getModel("formModel").setProperty("/PROJECTS", result);

            var oView = this.getView(),
                oSourceControl = oEvent.getSource();

            if (!this._pPopover3) {
                this._pPopover3 = Fragment.load({
                    id: oView.getId(),
                    name: "com.ibspl.leavemgmt2.view.fragments.LeaveBL"
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pPopover3.then(function (oPopover) {
                oPopover.openBy(oSourceControl);
            });
        },

        onPressOpenGLPopover: function (oEvent) {

            var oView = this.getView(),
                oSourceControl = oEvent.getSource();

            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.ibspl.leavemgmt2.view.fragments.GL"
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oSourceControl);
            });
        },

        onPressOpenCLPopover: function (oEvent) {

            var oView = this.getView(),
                oSourceControl = oEvent.getSource();

            if (!this._pPopover2) {
                this._pPopover2 = Fragment.load({
                    id: oView.getId(),
                    name: "com.ibspl.leavemgmt2.view.fragments.CL"
                }).then(function (oPopover2) {
                    oView.addDependent(oPopover2);
                    return oPopover2;
                });
            }

            this._pPopover2.then(function (oPopover2) {
                oPopover2.openBy(oSourceControl);
            });
        },

        getUserAttribute() {

            // var oModel = new JSONModel({
            //     userId: "farzeen.s@intellectbizware.com",
            //     userName: "Farzeen Sayyed"
            // });
            // var oModel = new JSONModel({
            //     userId: "vishal.s@intellectbizware.com",
            //     userName: "Vishal Suryawanshi"
            // });
            var oModel = new JSONModel({
                userId: "supritha.m@intellectbizware.com",
                userName: "Supritha Moolya"
            });
            context.getOwnerComponent().setModel(oModel, "userAttriJson");
            context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getData().userId);

            // var attr = appModulePath + "/user-api/attributes";
            // return new Promise(function (resolve, reject) {
            //     $.ajax({
            //         url: attr,
            //         type: 'GET',
            //         contentType: 'application/json',
            //         success: function (data, response) {
            //             var oModel = new JSONModel({
            //                 userId: data.email,
            //                 userName: data.firstname + " " + data.lastname
            //             });
            //             context.getOwnerComponent().setModel(oModel, "userAttriJson");
            //             context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getData().userId);
            //         },
            //         error: function (oError) {
            //             MessageBox.error("Error while reading User Attribute");
            //         }
            //     });
            // });
        },

        getEmployeeDetails: function (userId, msg) {

            var path = appModulePath + "/odata/v4/team-leave-planner/MasterEmployee?$filter=(EMAIL_ID eq '" + userId + "')&$expand=*";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {

                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/CASUAL_LEAVE_BALANCE", Number(oData.value[0].CASUAL_LEAVE_BALANCE));
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/EMAIL_ID", oData.value[0].EMAIL_ID);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/EMPLOYEE_ID", oData.value[0].EMPLOYEE_ID);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/EMPLOYEE_NAME", oData.value[0].EMPLOYEE_NAME);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/GENERAL_LEAVE_BALANCE", Number(oData.value[0].GENERAL_LEAVE_BALANCE));
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/MOBILE_NO", oData.value[0].MOBILE_NO);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/PROJECT", oData.value[0].PROJECT);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/REPORTING_LEAD_ID", oData.value[0].REPORTING_LEAD_ID);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/REPORTING_MANAGER_ID", oData.value[0].REPORTING_MANAGER_ID);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/ROLE", oData.value[0].TO_DESIGNATION_CODE[0].ROLE);

                    if (context.getOwnerComponent().getModel("userAttriJson").getProperty("/ROLE") === 'Requestor') {
                        context.onRead(context.getOwnerComponent().getModel("userAttriJson").getData().EMPLOYEE_ID, msg);
                        context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", true);
                        context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", false);
                    } else {
                        context.getTeamDetails(context.getOwnerComponent().getModel("userAttriJson").getData().EMPLOYEE_ID);
                        context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                        context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", true);
                    }

                    context.getEvents(context.getOwnerComponent().getModel("userAttriJson").getData().EMAIL_ID);
                    context.getLeaveTypes();

                    var path;
                    if (oData.value[0].REPORTING_LEAD_ID) {
                        path = appModulePath + "/odata/v4/team-leave-planner/MasterEmployee?$filter=(EMPLOYEE_ID eq " + oData.value[0].REPORTING_LEAD_ID + ")";
                    } else if (oData.value[0].REPORTING_MANAGER_ID) {
                        path = appModulePath + "/odata/v4/team-leave-planner/MasterEmployee?$filter=(EMPLOYEE_ID eq " + oData.value[0].REPORTING_MANAGER_ID + ")";
                    }

                    $.ajax({
                        url: path,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (oData, response) {

                            context.getOwnerComponent().getModel("userAttriJson").setProperty("/APPROVER", oData.value[0].EMPLOYEE_NAME);
                        },
                        error: function (oError) {
                            context.reuseError(oError);
                        }
                    });
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
        },

        getTeamDetails: function (empID) {
            var path = appModulePath + "/odata/v4/team-leave-planner/getEmployeeLeaveData(vEmployeeId=" + empID + ",sRole='Approver')";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {
                    
                    var oArray = [];
                    for (var i = 0; i < oData.value[0].Subordinates.EmployeeDetails.length; i++) {
                        for (var j = 0; j < oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo.length; j++) {
                            if (oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j].IS_DELETED !== 'X') {
                                oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j].EMPLOYEE_ID = oData.value[0].Subordinates.EmployeeDetails[i].EMPLOYEE_ID;
                                oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j].EMPLOYEE_NAME = oData.value[0].Subordinates.EmployeeDetails[i].EMPLOYEE_NAME;
                                oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j].CASUAL_LEAVE_BALANCE = oData.value[0].Subordinates.EmployeeDetails[i].CASUAL_LEAVE_BALANCE;
                                oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j].GENERAL_LEAVE_BALANCE = oData.value[0].Subordinates.EmployeeDetails[i].GENERAL_LEAVE_BALANCE;
                                oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j].EmployeeProjectDetail = oData.value[0].Subordinates.EmployeeDetails[i].EmployeeProjectDetail;
                                oArray.push(oData.value[0].Subordinates.EmployeeDetails[i].appointments.LeaveInfo[j]);
                            }
                        }
                    }
                    var oModel = new JSONModel({ teamsArray: oArray });
                    context.getOwnerComponent().setModel(oModel, "TeamsData");

                    var a = new Date();
                    var date = a.getDate();
                    var month = a.getMonth() + 1;
                    var year = a.getFullYear();
                    var hour = a.getHours();
                    var minute = a.getMinutes();
                    oData.value[0].startDate =  UI5Date.getInstance(year, month, date, hour, minute);

                    var oModel11 = new JSONModel(oData.value[0]);
                    context.getOwnerComponent().setModel(oModel11, "Calender1");

                    var oModel54 = new JSONModel({ value: oData.value[0].LeaveRequests.LeaveInfo });
                    context.getOwnerComponent().setModel(oModel54, "tableData");

                    const oLastCLLeave = context.findLastLeaveByTitle(oData.value[0].LeaveRequests.LeaveInfo, "CL");
                    const oLastGLLeave = context.findLastLeaveByTitle(oData.value[0].LeaveRequests.LeaveInfo, "GL");

                    context.getOwnerComponent().getModel("formModel").setProperty("/lastCLLeave", oLastCLLeave);
                    context.getOwnerComponent().getModel("formModel").setProperty("/lastGLLeave", oLastGLLeave);

                    var oModel2 = new JSONModel();
                    oModel2.setData({ appointments: oData.value[0].LeaveRequests.LeaveInfo });
                    context.getOwnerComponent().setModel(oModel2, "appointmentData");
                    BusyIndicator.hide(0);
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
        },

        // getTeamDetails: function () {

        //     var a = new Date();
        //     var date = a.getDate();
        //     var month = a.getMonth() + 1;
        //     var year = a.getFullYear();
        //     var hour = a.getHours();
        //     var minute = a.getMinutes();
        //     var obj = {
        //         "startDate": UI5Date.getInstance(year, month, date, hour, minute),
        //         "CASUAL_LEAVE_BALANCE": "8",
        //         "DESIGNATION": "Lead Consultant",
        //         "EMAIL_ID": "teju.moolya@gmail.com",
        //         "EMPLOYEE_ID": 119,
        //         "EMPLOYEE_NAME": "Teju Moolya",
        //         "GENERAL_LEAVE_BALANCE": "10",
        //         "MOBILE_NO": "45454545454",
        //         "PROJECT": "SAP",
        //         "REPORTING_LEAD": null,
        //         "REPORTING_MANAGER": "Swaroop Nagavarapu",
        //         "LeaveRequests": [
        //             {
        //                 "EMPLOYEE_ID": 119,
        //                 "END_DATE": "2025-01-15T18:29:00Z",
        //                 "IS_DELETED": null,
        //                 "LEAVE_ID": 100201,
        //                 "LEAVE_NOTES": "test",
        //                 "LEAVE_STATUS": 1,
        //                 "LEAVE_TYPE": "CL",
        //                 "NO_OF_LEAVES": "1",
        //                 "START_DATE": "2025-01-14T18:30:00Z"
        //             },
        //             {
        //                 "EMPLOYEE_ID": 119,
        //                 "END_DATE": "2025-01-16T18:29:00Z",
        //                 "IS_DELETED": null,
        //                 "LEAVE_ID": 100202,
        //                 "LEAVE_NOTES": "test",
        //                 "LEAVE_STATUS": 1,
        //                 "LEAVE_TYPE": "CL",
        //                 "NO_OF_LEAVES": "1",
        //                 "START_DATE": "2025-01-18T18:30:00Z"
        //             }
        //         ],
        //         "Subordinates": [
        //             {
        //                 "CASUAL_LEAVE_BALANCE": "8",
        //                 "DESIGNATION": "Consultant",
        //                 "EMAIL_ID": "farzeen.s@intellectbizware.com",
        //                 "EMPLOYEE_ID": 5028,
        //                 "EMPLOYEE_NAME": "Farzeen Sayyed",
        //                 "GENERAL_LEAVE_BALANCE": "20",
        //                 "MOBILE_NO": "56555665765",
        //                 "PROJECT": "iVen",
        //                 "REPORTING_LEAD": "Teju Moolya",
        //                 "REPORTING_MANAGER": "Swaroop Nagavarapu",
        //                 "appointments": [
        //                     {
        //                         "EMPLOYEE_ID": 5028,
        //                         "END_DATE": "2025-01-07T18:29:00Z",
        //                         "IS_DELETED": null,
        //                         "LEAVE_ID": 100182,
        //                         "LEAVE_NOTES": "test",
        //                         "LEAVE_STATUS": 1,
        //                         "LEAVE_TYPE": "CL",
        //                         "NO_OF_LEAVES": "1",
        //                         "START_DATE": "2025-01-06T18:30:00Z",
        //                         "EMAIL_ID": "farzeen.s@intellectbizware.com",
        //                         "EMPLOYEE_NAME": "Farzeen Sayyed",
        //                         "PROJECT": "iVen",
        //                         "CASUAL_LEAVE_BALANCE": "8",
        //                         "GENERAL_LEAVE_BALANCE": "20"
        //                     },
        //                     {
        //                         "EMPLOYEE_ID": 5028,
        //                         "END_DATE": "2025-01-13T18:29:00Z",
        //                         "IS_DELETED": null,
        //                         "LEAVE_ID": 100184,
        //                         "LEAVE_NOTES": "test",
        //                         "LEAVE_STATUS": 1,
        //                         "LEAVE_TYPE": "GL",
        //                         "NO_OF_LEAVES": "1",
        //                         "START_DATE": "2025-01-12T18:30:00Z",
        //                         "EMAIL_ID": "farzeen.s@intellectbizware.com",
        //                         "EMPLOYEE_NAME": "Farzeen Sayyed",
        //                         "PROJECT": "iVen",
        //                         "CASUAL_LEAVE_BALANCE": "8",
        //                         "GENERAL_LEAVE_BALANCE": "20"
        //                     },
        //                     {
        //                         "EMPLOYEE_ID": 5028,
        //                         "END_DATE": "2025-02-06T08:29:00Z",
        //                         "IS_DELETED": null,
        //                         "LEAVE_ID": 100205,
        //                         "LEAVE_NOTES": "test",
        //                         "LEAVE_STATUS": 1,
        //                         "LEAVE_TYPE": "CL_HALF_DAY",
        //                         "NO_OF_LEAVES": "0.5",
        //                         "START_DATE": "2025-02-06T03:30:00Z",
        //                         "EMAIL_ID": "farzeen.s@intellectbizware.com",
        //                         "EMPLOYEE_NAME": "Farzeen Sayyed",
        //                         "PROJECT": "iVen",
        //                         "CASUAL_LEAVE_BALANCE": "8",
        //                         "GENERAL_LEAVE_BALANCE": "20"
        //                     }
        //                 ]
        //             },
        //             {
        //                 "CASUAL_LEAVE_BALANCE": "7",
        //                 "DESIGNATION": "Consultant",
        //                 "EMAIL_ID": "vishal.s@intellectbizware.com",
        //                 "EMPLOYEE_ID": 5034,
        //                 "EMPLOYEE_NAME": "Vishal Suryawanshi",
        //                 "GENERAL_LEAVE_BALANCE": "9",
        //                 "MOBILE_NO": "56555665765",
        //                 "PROJECT": "Crompton",
        //                 "REPORTING_LEAD": "Teju Moolya",
        //                 "REPORTING_MANAGER": "Swaroop Nagavarapu",
        //                 "appointments": [
        //                     {
        //                         "EMPLOYEE_ID": 5034,
        //                         "END_DATE": "2025-01-07T18:29:00Z",
        //                         "IS_DELETED": null,
        //                         "LEAVE_ID": 100183,
        //                         "LEAVE_NOTES": "test",
        //                         "LEAVE_STATUS": 1,
        //                         "LEAVE_TYPE": "GL",
        //                         "NO_OF_LEAVES": "1",
        //                         "START_DATE": "2025-01-06T18:30:00Z",
        //                         "EMAIL_ID": "vishal.s@intellectbizware.com",
        //                         "EMPLOYEE_NAME": "Vishal Suryawanshi",
        //                         "PROJECT": "Crompton",
        //                         "CASUAL_LEAVE_BALANCE": "7",
        //                         "GENERAL_LEAVE_BALANCE": "9"
        //                     },
        //                     {
        //                         "EMPLOYEE_ID": 5034,
        //                         "END_DATE": "2025-01-15T18:29:00Z",
        //                         "IS_DELETED": null,
        //                         "LEAVE_ID": 100202,
        //                         "LEAVE_NOTES": "test",
        //                         "LEAVE_STATUS": 1,
        //                         "LEAVE_TYPE": "CL",
        //                         "NO_OF_LEAVES": "1",
        //                         "START_DATE": "2025-01-14T18:30:00Z",
        //                         "EMAIL_ID": "vishal.s@intellectbizware.com",
        //                         "EMPLOYEE_NAME": "Vishal Suryawanshi",
        //                         "PROJECT": "Crompton",
        //                         "CASUAL_LEAVE_BALANCE": "7",
        //                         "GENERAL_LEAVE_BALANCE": "9"
        //                     }
        //                 ]
        //             }
        //         ]
        //     };

        //     var oArray = [];
        //     for (var i = 0; i < obj.Subordinates.length; i++) {
        //         for (var j = 0; j < obj.Subordinates[i].appointments.length; j++) {
        //             oArray.push(obj.Subordinates[i].appointments[j]);
        //         }
        //     }

        //     var oModel = new JSONModel({ teamsArray: oArray });
        //     context.getOwnerComponent().setModel(oModel, "TeamsData");

        //     var oModel11 = new JSONModel(obj);
        //     context.getOwnerComponent().setModel(oModel11, "Calender1");


        //     var oModel54 = new JSONModel({
        //         value: obj.LeaveRequests
        //     });
        //     context.getOwnerComponent().setModel(oModel54, "tableData");

        //     const oLastCLLeave = context.findLastLeaveByTitle(obj.LeaveRequests, "CL");
        //     const oLastGLLeave = context.findLastLeaveByTitle(obj.LeaveRequests, "GL");

        //     context.getOwnerComponent().getModel("formModel").setProperty("/lastCLLeave", oLastCLLeave);
        //     context.getOwnerComponent().getModel("formModel").setProperty("/lastGLLeave", oLastGLLeave);

        //     var oModel2 = new JSONModel();
        //     oModel2.setData({
        //         appointments: obj.LeaveRequests
        //     });
        //     context.getOwnerComponent().setModel(oModel2, "appointmentData");
        //     BusyIndicator.hide(0);

        // },

        onRead: function (empID, msg) {

            var path = appModulePath + "/odata/v4/team-leave-planner/LeaveRequest?$filter=(EMPLOYEE_ID eq " + empID + ") and ((IS_DELETED eq null) or (IS_DELETED eq ''))";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {

                    var oModel = new JSONModel(oData);
                    context.getOwnerComponent().setModel(oModel, "tableData");

                    const oLastCLLeave = context.findLastLeaveByTitle(oData.value, "CL");
                    const oLastGLLeave = context.findLastLeaveByTitle(oData.value, "GL");

                    context.getOwnerComponent().getModel("formModel").setProperty("/lastCLLeave", oLastCLLeave);
                    context.getOwnerComponent().getModel("formModel").setProperty("/lastGLLeave", oLastGLLeave);

                    var oModel2 = new JSONModel();
                    oModel2.setData({ appointments: oData.value });
                    context.getOwnerComponent().setModel(oModel2, "appointmentData");

                    if (msg !== undefined) {

                        context.getOwnerComponent().getModel("formModel").setProperty("/leaveType", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/lDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                        context.getOwnerComponent().getModel("formModel").setProperty("/reason", "");

                        context.getView().byId("idCombo").setValueState("None");
                        context.getView().byId("idLWDate").setValueState("None");
                        context.getView().byId("idFDate").setValueState("None");
                        context.getView().byId("idTDate").setValueState("None");
                        context.getView().byId("idReason").setValueState("None");
                        context.getView().byId("idHalf").setValue("");

                        context.getOwnerComponent().getModel("formModel").setProperty("/halfType", false);
                        context.getOwnerComponent().getModel("formModel").setProperty("/lastDateVisible", false);

                        context.getOwnerComponent().getModel("formModel").refresh(true);
                        context.getView().byId("idCombo").setSelectedKey("");
                        context.getView().byId("idCombo").setValue("");
                        context.getView().byId("idHalf").setValue("");

                        MessageBox.success(msg, {
                            actions: [MessageBox.Action.OK],
                            onClose: function (oAction) {
                                if (oAction === "OK") {
                                    // if (Device.system.phone === true) {
                                    context.getView().byId("idDynamicSideContent").setShowSideContent(false);
                                    context.getView().byId("idDynamicSideContent").setShowMainContent(true);
                                    // }
                                }
                            }
                        });
                    }
                    BusyIndicator.hide(0);
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
        },

        findLastLeaveByTitle: function (leaveData, title) {

            const filteredLeaves = leaveData.filter(leave => leave.LEAVE_TYPE === title);
            const sortedLeaves = filteredLeaves.sort((a, b) =>
                new Date(b.END_DATE) - new Date(a.END_DATE)
            );
            if (sortedLeaves.length > 0) {
                var DateInstance = new Date(sortedLeaves[0].END_DATE);
                var date = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd-MM-yyyy"
                });
                return date.format(DateInstance);
            } else {
                return "None";
            }
        },

        getEvents: function (userId) {
            var path = appModulePath + "/odata/v4/team-leave-planner/LeaveEventLog?$filter=(USER_ID eq '" + userId + "')";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {

                    BusyIndicator.hide();
                    var oModel = new JSONModel(oData);
                    context.getOwnerComponent().setModel(oModel, "EventData");
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
        },

        getLeaveTypes() {
            var path = appModulePath + "/odata/v4/team-leave-planner/MasterLeaveType";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {

                    var CL = context.getOwnerComponent().getModel("userAttriJson").getProperty("/CASUAL_LEAVE_BALANCE");
                    var GL = context.getOwnerComponent().getModel("userAttriJson").getProperty("/GENERAL_LEAVE_BALANCE");
                    for (var i = 0; i < oData.value.length; i++) {
                        if (oData.value[i].CODE === 'CL' || oData.value[i].CODE === 'CL_HALF_DAY') {
                            if (CL == 0) {
                                oData.value[i].ENABLED = false;
                            } else {
                                oData.value[i].ENABLED = true;
                            }
                        } else if (oData.value[i].CODE === 'GL' || oData.value[i].CODE === 'GL_HALF_DAY') {
                            if (GL == 0) {
                                oData.value[i].ENABLED = false;
                            } else {
                                oData.value[i].ENABLED = true;
                            }
                        } else {
                            oData.value[i].ENABLED = true;
                        }
                    }
                    var oModel = new JSONModel(oData);
                    context.getOwnerComponent().setModel(oModel, "LeaveTypeData");
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
        },

        onSegBtn: function (oEvent) {

            var sKey = oEvent.getParameter('item').getKey();
            if (sKey === 'requests') {
                if (context.getOwnerComponent().getModel("userAttriJson").getProperty("/ROLE") === 'Requestor') {
                    context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", true);
                    context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", false);
                } else {
                    context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                    context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", false);

                    context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", true);
                    context.getOwnerComponent().getModel("formModel").setProperty("/calendarForApprover", false);

                    context.getOwnerComponent().getModel("formModel").setProperty("/key", "teams");
                }
            } else if (sKey === 'calendar') {
                if (context.getOwnerComponent().getModel("userAttriJson").getProperty("/ROLE") === 'Requestor') {
                    context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                    context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", true);
                } else {
                    context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", false);
                    context.getOwnerComponent().getModel("formModel").setProperty("/calendarForApprover", true);

                    context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                    context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", false);

                    context.getOwnerComponent().getModel("formModel").setProperty("/key1", "teams");
                }
            }
            context.getOwnerComponent().getModel("formModel").refresh(true);
        },

        onSegBtn2: function (oEvent) {

            var sKey = oEvent.getParameter('item').getKey();
            if (sKey === 'teams') {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", false);

                context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", true);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForApprover", false);

            } else if (sKey === 'self') {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", true);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", false);

                context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForApprover", false);
            }
            context.getOwnerComponent().getModel("formModel").setProperty("/key", sKey);
            context.getOwnerComponent().getModel("formModel").refresh(true);
        },

        onSegBtn3: function (oEvent) {

            var sKey = oEvent.getParameter('item').getKey();
            if (sKey === 'teams') {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", false);

                context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForApprover", true);

            } else if (sKey === 'self') {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableForRequester", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForRequester", true);

                context.getOwnerComponent().getModel("formModel").setProperty("/tableForApprover", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarForApprover", false);
            }
            context.getOwnerComponent().getModel("formModel").setProperty("/key1", sKey);
            context.getOwnerComponent().getModel("formModel").refresh(true);
        },

        onAppTextArea: function (oEvent) {

        },

        onReject2: function (oEvent) {

            if (oEvent.getSource().getBindingContext("TeamsData") === undefined) {
                rejectObj = that.getView().getModel("AppointDetail").getData();
            } else {
                rejectObj = oEvent.getSource().getBindingContext("TeamsData").getObject();
            }

            if (!this.rejectDialog) {
                this.rejectDialog = new sap.ui.xmlfragment("com.ibspl.leavemgmt2.view.fragments.Reject", this);
                this.getView().addDependent(this.rejectDialog);
            }
            this.rejectDialog.open();
        },

        RejectClose: function () {
            this.rejectDialog.close();
            this.rejectDialog.destroy();
            this.rejectDialog = null;
        },

        onRejectApproval: function (oEvent) {
            var obj = {
                "sAction": "REJECT",
                "aLeaveRequestInfo": [{
                    "LEAVE_ID": rejectObj.LEAVE_ID || Number(rejectObj.key),
                    "EMPLOYEE_ID": rejectObj.EMPLOYEE_ID || Number(rejectObj.description)
                }],
                "aLeaveEventLog": [{
                    "LEAVE_ID": rejectObj.LEAVE_ID || Number(rejectObj.key),
                    "EVENT_NO": 1,//hardcode
                    "EVENT_CODE": "REJ",
                    "USER_ID": that.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"),
                    "USER_NAME": that.getOwnerComponent().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME"),
                    "REMARK": "Leave Request Rejected by Team Lead",
                    "COMMENT": sap.ui.getCore().byId("idRejComment").getValue(),
                    "CREATED_ON": new Date()
                }]
            };
            var data = JSON.stringify(obj);
            var path = appModulePath + "/odata/v4/team-leave-planner/TeamLeaveApproval";
            BusyIndicator.show(0);
            $.ajax({
                url: path,
                type: 'POST',
                data: data,
                contentType: 'application/json',
                success: function (oData, response) {

                    BusyIndicator.hide(0);
                    MessageBox.success(oData.value[0], {
                        actions: [MessageBox.Action.OK],
                        onClose: function (oAction) {
                            if (oAction === "OK") {


                            }
                        }
                    });
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
            this.RejectClose();
        },

        handleTextReject: function (oEvent) {

            var sText = oEvent.getSource().getValue();
            sap.ui.getCore().byId("idButReject").setEnabled(sText.length > 0);
        },

        onApprove2: function (oEvent) {

            if (oEvent.getSource().getBindingContext("TeamsData") === undefined) {
                approveObj = that.getView().getModel("AppointDetail").getData();
            } else {
                approveObj = oEvent.getSource().getBindingContext("TeamsData").getObject();
            }

            if (!this.approveDialog) {
                this.approveDialog = new sap.ui.xmlfragment("com.ibspl.leavemgmt2.view.fragments.Approve", this);
                this.getView().addDependent(this.approveDialog);
            }
            this.approveDialog.open();
        },

        ApproveClose: function () {
            this.approveDialog.close();
            this.approveDialog.destroy();
            this.approveDialog = null;
        },

        onSubmitApproval: function (oEvent) {

            var obj = {
                "sAction": "APPROVE",
                "aLeaveRequestInfo": [{
                    "LEAVE_ID": approveObj.LEAVE_ID || Number(approveObj.key),
                    "EMPLOYEE_ID": approveObj.EMPLOYEE_ID || Number(approveObj.description)
                }],
                "aLeaveEventLog": [{
                    "LEAVE_ID": approveObj.LEAVE_ID || Number(approveObj.key),
                    "EVENT_NO": 1,//hardcode
                    "EVENT_CODE": "APR",
                    "USER_ID": that.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"),
                    "USER_NAME": that.getOwnerComponent().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME"),
                    "REMARK": "Leave Request Approved by Team Lead",
                    "COMMENT": sap.ui.getCore().byId("idAppComment").getValue(),
                    "CREATED_ON": new Date()
                }]
            };
            var data = JSON.stringify(obj);
            var path = appModulePath + "/odata/v4/team-leave-planner/TeamLeaveApproval";
            BusyIndicator.show(0);
            $.ajax({
                url: path,
                type: 'POST',
                data: data,
                contentType: 'application/json',
                success: function (oData, response) {

                    BusyIndicator.hide(0);
                    MessageBox.success(oData.value[0], {
                        actions: [MessageBox.Action.OK],
                        onClose: function (oAction) {
                            if (oAction === "OK") {


                            }
                        }
                    });
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
            this.ApproveClose();
        },

        isValidJsonString: function (sDataString) {

            var value = null;
            var oArrObj = null;
            var sErrorMessage = "";
            try {
                if (sDataString === null || sDataString === "" || sDataString === undefined) {
                    throw "No data found.";
                }

                value = JSON.parse(sDataString);
                if (toString.call(value) === '[object Object]' && Object.keys(value).length > 0) {
                    return true;
                } else {
                    throw "Error";
                }
            } catch (errorMsg) {
                if (errorMsg === "No data found.") {
                    sErrorMessage = errorMsg;
                } else {
                    sErrorMessage = "Invalid JSON data."
                }
                return false;
            }
            return true;
        },

        reuseError: function (error) {
            BusyIndicator.hide();
            var oXMLMsg, oXML;
            if (this.isValidJsonString(error.responseText)) {
                oXML = JSON.parse(error.responseText);
                oXMLMsg = oXML.error["message"];
            } else {
                oXMLMsg = error.responseText
            }
            MessageBox.error(oXMLMsg);
        },
    });
});