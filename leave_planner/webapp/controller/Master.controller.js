sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "sap/ui/unified/library",
    "sap/ui/core/library",
    "sap/m/library",
    "com/ibspl/leaveplanner/model/formatter",
    "sap/ui/Device"

], (Controller, JSONModel, MessageBox, Fragment, BusyIndicator, unifiedLibrary, coreLibrary, mobileLibrary, formatter, Device) => {
    "use strict";
    var that;
    var context;
    var appModulePath;
    var rowObj;

    var CalendarDayType = unifiedLibrary.CalendarDayType;
    var ValueState = coreLibrary.ValueState;
    var StickyMode = mobileLibrary.PlanningCalendarStickyMode;

    return Controller.extend("com.ibspl.leaveplanner.controller.Master", {

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
                tableVisible: true,
                calendarVisible: false,
                halfType: false,
                button: false
            });
            context.getOwnerComponent().setModel(oModel, "formModel");
            BusyIndicator.show(0);

            this.onAdd();
            this.getUserAttribute();
        },

        onAdd: function (msg) {

            var dynamicSideContentState = this.getView().byId("idDynamicSideContent").getShowSideContent();
            if (dynamicSideContentState === true) {
                if (Device.system.phone === true) {
                    this.getView().byId("idDynamicSideContent").setShowSideContent(false);
                    this.getView().byId("idDynamicSideContent").setShowMainContent(true);
                    this.getOwnerComponent().getModel("formModel").setProperty("/button", true);
                }
            }
            else {
                if (Device.system.phone === true) {
                    this.getView().byId("idDynamicSideContent").setShowSideContent(true);
                    this.getView().byId("idDynamicSideContent").setShowMainContent(false);
                }
            }
        },

        onSwitchChange: function (oEvent) {
            var bState = oEvent.getParameter('state'); //false
            if (bState === false) {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableVisible", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarVisible", true);
            } else if (bState === true) {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableVisible", true);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarVisible", false);
            }
        },

        onSegButton: function (oEvent) {

            var sKey = oEvent.getParameter('item').getKey();
            if (sKey === 'table') {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableVisible", true);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarVisible", false);
            } else if (sKey === 'calendar') {
                context.getOwnerComponent().getModel("formModel").setProperty("/tableVisible", false);
                context.getOwnerComponent().getModel("formModel").setProperty("/calendarVisible", true);
            }
            context.getOwnerComponent().getModel("formModel").refresh(true);
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

            context.getView().byId("idCombo").setValueState(sap.ui.core.ValueState.None);
            context.getView().byId("idLWDate").setValueState(sap.ui.core.ValueState.None);
            context.getView().byId("idFDate").setValueState(sap.ui.core.ValueState.None);
            context.getView().byId("idTDate").setValueState(sap.ui.core.ValueState.None);
            context.getView().byId("idReason").setValueState(sap.ui.core.ValueState.None);
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

        onSelectionChangeOfHalf: function (oEvent) {

            var sKey = oEvent.getSource().getSelectedKey();
            var fromDate = context.getOwnerComponent().getModel("formModel").getProperty("/fDate");
            var toDate = context.getOwnerComponent().getModel("formModel").getProperty("/tDate");
            if (sKey === 'First_Half') {
                fromDate.setHours("9");
                fromDate.toISOString();
                fromDate = new Date(fromDate);
                toDate.setHours("13");
            } else if (sKey === 'Second_Half') {
                fromDate.setHours("14");
                fromDate.toISOString();
                fromDate = new Date(fromDate);
                toDate.setHours("18");
            }
            context.getOwnerComponent().getModel("formModel").setProperty("/fDate", fromDate);
            context.getOwnerComponent().getModel("formModel").setProperty("/tDate", toDate);
        },

        getUserAttribute() {
           
            var oModel = new JSONModel({
                userId: "farzeen.s@intellectbizware.com",
                userName: "Farzeen Bano"
            });
            context.getOwnerComponent().setModel(oModel, "userAttriJson");
            context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getData().userId);


            // var userInfo = sap.ushell.Container.getService("UserInfo");
            // var oModel = new JSONModel({
            //     userId: userInfo.getEmail(),
            //     userName: userInfo.getFirstName()
            // });
            // context.getOwnerComponent().setModel(oModel, "userAttriJson");
            // context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getData().userId);
        },

        getEmployeeDetails: function (userId, msg) {
            var path = appModulePath + "/odata/v4/team-leave-planner/MASTER_EMPLOYEE?$filter=(EMAIL_ID eq '" + userId + "')";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {

                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/CASUAL_LEAVE_BALANCE", Number(oData.value[0].CASUAL_LEAVE_BALANCE));
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/DESIGNATION", oData.value[0].DESIGNATION);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/EMAIL_ID", oData.value[0].EMAIL_ID);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/EMPLOYEE_ID", oData.value[0].EMPLOYEE_ID);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/EMPLOYEE_NAME", oData.value[0].EMPLOYEE_NAME);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/GENERAL_LEAVE_BALANCE", Number(oData.value[0].GENERAL_LEAVE_BALANCE));
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/MOBILE_NO", oData.value[0].MOBILE_NO);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/PROJECT", oData.value[0].PROJECT);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/REPORTING_LEAD", oData.value[0].REPORTING_LEAD);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/REPORTING_MANAGER", oData.value[0].REPORTING_MANAGER);

                    context.onRead(context.getOwnerComponent().getModel("userAttriJson").getData().EMPLOYEE_ID, msg);
                    context.getEvents(context.getOwnerComponent().getModel("userAttriJson").getData().EMAIL_ID);
                    context.getLeaveTypes();
                },
                error: function (oError) {
                    context.reuseError(oError);
                }
            });
        },

        onRead: function (empID, msg) {

            var path = appModulePath + "/odata/v4/team-leave-planner/TEAM_LEAVE_INFO?$filter=(EMPLOYEE_ID eq " + empID + ") and (IS_DELETED eq null)";
            $.ajax({
                url: path,
                type: 'GET',
                contentType: 'application/json',
                success: function (oData, response) {
                    debugger;
                    var oModel = new JSONModel(oData);
                    context.getView().setModel(oModel, "tableData");
                    var addLen = oData.value.length;
                    context.getView().byId("trAddId").setVisibleRowCount(addLen);
                    context.getOwnerComponent().getModel("userAttriJson").setProperty("/COUNT", addLen);

                    var oArray = [];
                    for (var i = 0; i < oData.value.length; i++) {
                        const startDate = new Date(oData.value[i].START_DATE);
                        const endDate = new Date(oData.value[i].END_DATE);
                        const differenceInMs = endDate - startDate;

                        var sType;
                        if (oData.value[i].LEAVE_TYPE === 'GL' || oData.value[i].LEAVE_TYPE === 'GL_HALF_DAY') {
                            sType = CalendarDayType.Type05;
                        } else if (oData.value[i].LEAVE_TYPE === 'CL' || oData.value[i].LEAVE_TYPE === 'CL_HALF_DAY') {
                            sType = CalendarDayType.Type03;
                        } else if (oData.value[i].LEAVE_TYPE === 'ML' || oData.value[i].LEAVE_TYPE === 'LWP') {
                            sType = CalendarDayType.Type09;
                        } else if (oData.value[i].LEAVE_TYPE === 'BA' || oData.value[i].LEAVE_TYPE === 'CO') {
                            sType = CalendarDayType.Type08;
                        }

                        oArray.push({
                            title: oData.value[i].LEAVE_TYPE,
                            text: oData.value[i].LEAVE_NOTES,
                            type: sType,
                            startDate: new Date(oData.value[i].START_DATE),
                            endDate: new Date(oData.value[i].END_DATE)
                        });
                    }
                    var oModel2 = new JSONModel();
                    oModel2.setData({
                        appointments: oArray
                    });
                    context.getOwnerComponent().setModel(oModel2, "appointmentData");

                    if (msg !== undefined) {

                        context.getOwnerComponent().getModel("formModel").setProperty("/leaveType", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                        context.getOwnerComponent().getModel("formModel").setProperty("/reason", "");
                        context.getOwnerComponent().getModel("formModel").refresh(true);
                        context.getView().byId("idCombo").setSelectedKey("");
                        context.getView().byId("idCombo").setValue("");
                        context.getView().byId("idHalf").setValue("");

                        MessageBox.success(msg, {
                            actions: [MessageBox.Action.OK],
                            onClose: function (oAction) {
                                if (oAction === "OK") {
                                    if (Device.system.phone === true) {
                                        context.getView().byId("idDynamicSideContent").setShowSideContent(false);
                                        context.getView().byId("idDynamicSideContent").setShowMainContent(true);
                                    }
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

        onBeforeRebindTable: function (oEvent) {
            debugger;
        },

        getEvents: function (userId) {
            var path = appModulePath + "/odata/v4/team-leave-planner/LEAVE_EVENT_LOG?$filter=(USER_ID eq '" + userId + "')";
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
            var path = appModulePath + "/odata/v4/team-leave-planner/MASTER_LEAVE_TYPE";
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

        onReasonChange: function (oEvent) {
            
            var sValue = oEvent.getParameter("value");
            context.getOwnerComponent().getModel("formModel").setProperty("/reason", sValue);
            if (sValue !== "") {
                var length = sValue.length;
                length = 100 - length;
                context.getView().byId("idText").setText(length +" characters remaining");

                context.getView().byId("idReason").setValueState(sap.ui.core.ValueState.None);
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
                oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Leave already applied for this date.");
                context.getOwnerComponent().getModel("formModel").setProperty("/lDate", "");
                context.getView().byId("idReason").setValue("");
                return;
            } else {
                context.getOwnerComponent().getModel("formModel").setProperty("/lDate", sLWDate);
                context.getView().byId("idLWDate").setValueState(sap.ui.core.ValueState.None);
                var sDate = oEvent.getParameter("value");
                context.getView().byId("idReason").setValue("Compensatory Date:- " +sDate +"\n" +"Note: ");

                var length = context.getView().byId("idReason").getValue().length;
                length = 100 - length;
                context.getView().byId("idText").setText(length +" characters remaining");
            }
        },

        onFDate: function (oEvent) {
            
            var sFDate = oEvent.getSource().getDateValue();
            var leaveData = context.getOwnerComponent().getModel("tableData").getData().value;

            const isDateInRange = leaveData.some(leave => {
                const startDate = new Date(leave.START_DATE);
                const endDate = new Date(leave.END_DATE);
                return sFDate >= startDate && sFDate <= endDate;
            });

            if (isDateInRange) {
                oEvent.getSource().setValue("");
                oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Leave already applied for this date.");
                context.getOwnerComponent().getModel("formModel").setProperty("/fDate", "");
                return;
            }

            if (context.getView().byId("idCombo").getSelectedKey() !== 'ML') {
                if (sFDate.getDay() === 0 || sFDate.getDay() === 6) {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Cannot pick weekend date!");
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
                    context.getView().byId("idFDate").setValueState(sap.ui.core.ValueState.None);
                    context.getView().byId("idTDate").setValueState(sap.ui.core.ValueState.None);
                }
            }
            else if (context.getView().byId("idCombo").getSelectedKey() === 'ML') {
                if (sFDate.getDay() === 0 || sFDate.getDay() === 6) {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Cannot pick weekend date!");
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
                    context.getView().byId("idFDate").setValueState(sap.ui.core.ValueState.None);
                    context.getView().byId("idTDate").setValueState(sap.ui.core.ValueState.None);
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
                context.getView().byId("idFDate").setValueState(sap.ui.core.ValueState.None);
                context.getView().byId("idTDate").setValueState(sap.ui.core.ValueState.None);
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
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("GL balance is low");
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
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("CL balance is low");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                        return;
                    }
                }

                if (date1 > date2) {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("To Date cannot be lesser than From Date");
                    context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                } else if (date2.getDay() === 0 || date2.getDay() === 6) {
                    if (context.getView().byId("idCombo").getSelectedKey() !== 'CO') {
                        oEvent.getSource().setValue("");
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Cannot pick weekend date!");
                        context.getOwnerComponent().getModel("formModel").setProperty("/tDate", "");
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                    }
                } else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                }
            } else if (context.getOwnerComponent().getModel("formModel").getProperty("/fDate") === "") {
                oEvent.getSource().setValue("");
                oEvent.getSource().setValueState(sap.ui.core.ValueState.Error).setValueStateText("Select From Date first");
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
                context.getView().byId("idCombo").setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please select Leave Type");
            }
            if (sfDate === "" || sfDate === null) {
                context.getView().byId("idFDate").setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please select Date");
            }
            if (tDate === "" || tDate === null) {
                context.getView().byId("idTDate").setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please select Date");
            }
            if (sreason === "" || sreason === null) {
                context.getView().byId("idReason").setValueState(sap.ui.core.ValueState.Error).setValueStateText("Please write reason");
            }

            if (sLeaveType !== "" && sfDate !== "" && tDate !== "" && sreason !== "") {
                var path = appModulePath + "/odata/v4/team-leave-planner/TeamLeaveAction";
                var fromDate = context.getOwnerComponent().getModel("formModel").getProperty("/fDate");
                fromDate = fromDate.toISOString().split(".")[0];
                var toDate = context.getOwnerComponent().getModel("formModel").getProperty("/tDate");
                toDate = toDate.toISOString().split(".")[0];


                var obj = {
                    "action": "CREATE",
                    "teamLeaveInfo": [{
                        "LEAVE_ID": 1,//hardcode
                        "EMPLOYEE_ID": context.getOwnerComponent().getModel("userAttriJson").getData().EMPLOYEE_ID,
                        "LEAVE_TYPE": context.getOwnerComponent().getModel("formModel").getProperty("/leaveType"),
                        "NO_OF_LEAVES": context.getOwnerComponent().getModel("formModel").getProperty("/days"),
                        "START_DATE": fromDate,
                        "END_DATE": toDate,
                        "LEAVE_STATUS": 1,
                        "LEAVE_NOTES": context.getOwnerComponent().getModel("formModel").getProperty("/reason")
                    }],
                    "leaveEvents": [{
                        "LEAVE_ID": 1,//hardcode
                        "EVENT_NO": 1,//hardcode
                        "EVENT_CODE": "CR",
                        "USER_ID": context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"),
                        "USER_NAME": context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME"),
                        "REMARK": "Leave Request Created",//hardcode
                        // "COMMENT": "Leave request created by employee id : 113",
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
                        var msg = oData.value[0];
                        context.getOwnerComponent().getModel("formModel").setProperty("/days", 0);
                        context.getEmployeeDetails(context.getOwnerComponent().getModel("userAttriJson").getProperty("/EMAIL_ID"), msg);
                    },
                    error: function (oError) {
                        context.reuseError(oError);
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
                            "action": "DELETE",
                            "teamLeaveInfo": [{
                                "LEAVE_ID": rowObj.LEAVE_ID,
                                "EMPLOYEE_ID": rowObj.EMPLOYEE_ID
                            }],
                            "leaveEvents": [{
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

                                var msg = oData.value[0];
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
                    name: "com.ibspl.leaveplanner.view.fragments.Details",
                    controller: this
                }).then(function (oResponsivePopover) {
                    oView.addDependent(oResponsivePopover);
                    oResponsivePopover.bindElement("/AppointDetail");
                    return oResponsivePopover;
                });
            }
            this._pDetailsPopover.then(function (oResponsivePopover) {
                // oResponsivePopover.setBindingContext(oAppointment.getBindingContext());
                // oResponsivePopover.setPlacement("Left");
                oResponsivePopover.openBy(oAppointment);
            });
        },

        handlePopoverCloseButton: function (oEvent) {
            this.byId("detailsPopover").close();
        }
    });
});