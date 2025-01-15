sap.ui.define([], function () {
	"use strict";
	return {

		formatDate: function (oDate) {
	
			if (oDate !== "" && oDate !== null && oDate !== undefined) {
				var DateInstance = new Date(oDate);
				var date = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd-MM-yyyy"
				});
				return date.format(DateInstance);
			} 
			return "";
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
			}
		},

		formatLeaveStatus: function (oStatus) {
	
			if (oStatus === 1) {
				return "Pending";
			} else if (oStatus === 2) {
				return "Approved by Lead";
			} else if (oStatus === 3) {
				return "Rejected by Lead";
			} else if (oStatus === 4) {
				return "Approved by Manager";
			} else if (oStatus === 5) {
				return "Rejected by Manager";
			}
		},

		formatLeaveStatusState: function (oStatus) {
	
			if (oStatus === 1) {
				return "Warning";
			} else if (oStatus === 2 || oStatus === 4) {
				return "Success";
			} else if (oStatus === 3 || oStatus === 5) {
				return "Error";
			}
		},

		formatLeaveStatusIcon: function (oStatus) {
	
			if (oStatus === 1) {
				return "sap-icon://alert";
			} else if (oStatus === 2 || oStatus === 4) {
				return "sap-icon://sys-enter-2";
			} else if (oStatus === 3 || oStatus === 5) {
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
			
		}
	};
});