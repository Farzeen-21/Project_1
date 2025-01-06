sap.ui.define([
	'sap/ui/core/mvc/ControllerExtension',
	"sap/ui/model/json/JSONModel",
	"sap/m/BusyIndicator",
	"sap/m/MessageBox"

], function (ControllerExtension, JSONModel, BusyIndicator, MessageBox) {
	'use strict';
	var appModulePath;
	var that;

	return ControllerExtension.extend('com.ibspl.leaveapproval.ext.controller.ObjectReportExt', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf com.ibspl.leaveapproval.ext.controller.ObjectReportExt
             */
			onInit: function () {
				debugger;
				that = this;
				appModulePath = document.location.origin;
				this.base.getAppComponent().getRouter().getRoute('TEAM_LEAVE_INFOObjectPage').attachPatternMatched(this._onRouteMatched, this);
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
			},

			onAfterRendering: function () {
				debugger;
				// this.getUserAttribute();
			}
		},

		_onRouteMatched: function (oEvent) {
			debugger;
			var empID = Number(oEvent.getParameter('arguments').key.split(",")[1].split("=")[1]);
			this.getEmployeeDetails(empID);

			// this.getUserAttribute();
		},

		// getUserAttribute() {
		// 	debugger;
		// 	var oModel = new JSONModel({
		// 		userId: "teju.moolya@gmail.com",
		// 		userName: "Teju"
		// 	});
		// 	sap.ui.getCore().setModel(oModel, "userAttriJson");

			
		// 	// var userInfo = sap.ushell.Container.getService("UserInfo");
		// 	// var oModel = new JSONModel({
		// 	//     userId: userInfo.getEmail(),
		// 	//     userName: userInfo.getFirstName()
		// 	// });
		// 	// sap.ui.getCore().setModel(oModel, "userAttriJson");

		// 	this.getEmployeeDetails(sap.ui.getCore().getModel("userAttriJson").getData().userId);
		// },

		getEmployeeDetails: function (sUserId, msg) {
			debugger;
			var path = appModulePath + "/odata/v4/team-leave-planner/MASTER_EMPLOYEE?$expand=TO_PROJECT&$filter=(EMPLOYEE_ID eq " + sUserId + ")";
			$.ajax({
				url: path,
				type: 'GET',
				contentType: 'application/json',
				success: function (oData, response) {
					debugger;
					var oModel2 = new JSONModel(oData.value[0]);
					that.base.getView().setModel(oModel2, "master_emp")
				},
				error: function (oError) {
					
					MessageBox.error("Error");
				}
			});
		}
	});
});
