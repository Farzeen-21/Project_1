sap.ui.define([
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/library"
],
	function (UI5Date, unifiedLibrary) {
		"use strict";
		var CalendarDayType = unifiedLibrary.CalendarDayType;

		return {

			formatDate: function (oDate, half) {
				
				if (half === 'BA' || half === 'CL_HALF_DAY' || half === 'GL_HALF_DAY') {
					if (oDate !== "" && oDate !== null && oDate !== undefined) {
						var DateInstance = new Date(oDate);
						var date = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd-MM-yyyy hh:mm a"
						});
						return date.format(DateInstance);
					}
					return "";
				}
				else {
					if (oDate !== "" && oDate !== null && oDate !== undefined) {
						var DateInstance = new Date(oDate);
						var date = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd-MM-yyyy"
						});
						return date.format(DateInstance);
					}
					return "";
				}
			},

			formatDateWithTime: function (oDate, half) {
				
				if (half.includes("Birthday Anniversary") || half.includes("CL Half Day") || half.includes("GL Half Day")) {
					if (oDate !== "" && oDate !== null && oDate !== undefined) {
						var DateInstance = new Date(oDate);
						var date = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd-MM-yyyy hh:mm a"
						});
						return date.format(DateInstance);
					}
					return "";
				}
				else {
					if (oDate !== "" && oDate !== null && oDate !== undefined) {
						var DateInstance = new Date(oDate);
						var date = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd-MM-yyyy"
						});
						return date.format(DateInstance);
					}
					return "";
				}
			},

			deleteIcon: function (sDate, iStatus) {
				if (iStatus === 1) {
					return true;
				} else if (iStatus === 4 || iStatus === 5) {
					return false;
				} else if (iStatus === 2 || iStatus === 3) {
					//'2025-03-25T03:30:00.000Z'
					//Tue Mar 25 2025 09:00:00 GMT+0530 (India Standard Time)
					var oDate = new Date(sDate);
					var currentDate = new Date();
					if ((oDate>currentDate || oDate<currentDate) && oDate!=currentDate) {
						return true;
					}
				}
			},

			formatToDateObject: function (oDate) {
				if (oDate !== "" && oDate !== null && oDate !== undefined) {
					var DateInstance = UI5Date.getInstance(oDate);
					return DateInstance;
				}
				return new Date();
			},

			formatLeaveType: function (oLeave) {
				if (oLeave === "BA") {
					return "Birthday Anniversary";
				} else if (oLeave === "CL") {
					return "Casual Leave";
				} else if (oLeave === "CL_HALF_DAY") {
					return "CL Half Day";
				} else if (oLeave === "CO") {
					return "Compensatory Off";
				} else if (oLeave === "GL") {
					return "General Leave";
				} else if (oLeave === "GL_HALF_DAY") {
					return "GL Half Day";
				} else if (oLeave === "LWP") {
					return "Leave Without Pay";
				} else if (oLeave === "ML") {
					return "Maternity Leave";
				} else if (oLeave === "WFH") {
					return "Work From Home";
				}
			},

			formatLeaveStatus: function (oStatus) {
				if (oStatus === 1) {
					return "Pending";
				} else if (oStatus === 2) {
					return "Approved by Lead";
				} else if (oStatus === 3) {
					return "Approved by Manager";
				} else if (oStatus === 4) {
					return "Rejected by Lead";
				} else if (oStatus === 5) {
					return "Rejected by Manager";
				}
			},

			formatLeaveStatusState: function (oStatus) {
				if (oStatus === 1) {
					return "Warning";
				} else if (oStatus === 2 || oStatus === 3) {
					return "Success";
				} else if (oStatus === 4 || oStatus === 5) {
					return "Error";
				}
			},

			formatLeaveStatusIcon: function (oStatus) {
				if (oStatus === 1) {
					return "sap-icon://alert";
				} else if (oStatus === 2 || oStatus === 3) {
					return "sap-icon://sys-enter-2";
				} else if (oStatus === 4 || oStatus === 5) {
					return "sap-icon://error";
				}
			},

			getStatus: function (oStatus) {
				if (oStatus == 0) {
					return "Error";
				} else if (oStatus <= 3) {
					return "Warning";
				} else {
					return "Success";
				}
			},

			formatType: function (iStatus) {
				if (iStatus === 1) {
					return CalendarDayType.Type01;
				} else if (iStatus === 2 || iStatus === 3) {
					return CalendarDayType.Type08;
				} else if (iStatus === 4 || iStatus === 5) {
					return CalendarDayType.Type02;
				}
			}
		};
	});