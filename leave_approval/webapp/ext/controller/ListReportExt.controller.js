sap.ui.define([
	'sap/ui/core/mvc/ControllerExtension',
	"sap/ui/model/json/JSONModel",
	"sap/m/BusyIndicator",
	"sap/m/MessageBox"


], function (ControllerExtension, JSONModel, BusyIndicator, MessageBox) {
	'use strict';
	var appModulePath;
	var context;

	return ControllerExtension.extend('com.ibspl.leaveapproval.ext.controller.ListReportExt', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf com.ibspl.leaveapproval.ext.controller.ListReportExt
			 */

			onInit: function () {
				
				context = this;
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
				

				appModulePath = document.location.origin;
				this.getUserAttribute();
			},

			onAfterRendering: function () {
				
				this.getUserAttribute();
				this.getUserAttribute();
				//trying to apply filter by getting getTable()
				// do not forget this
			}

		},
		getUserAttribute() {
			
			var oModel = new JSONModel({
				userId: "supritha.m@intellectbizware.com",
				userName: "Supritha"
			});
			sap.ui.getCore().setModel(oModel, "userAttriJson");

			
			// var userInfo = sap.ushell.Container.getService("UserInfo");
			// var oModel = new JSONModel({
            //     userId: userInfo.getEmail(),
            //     userName: userInfo.getFirstName()
            // });
			// sap.ui.getCore().setModel(oModel, "userAttriJson");

			this.getEmployeeDetails(sap.ui.getCore().getModel("userAttriJson").getData().userId);
		},

		getEmployeeDetails: function (sUserId, msg) {
			
			var path = appModulePath + "/odata/v4/team-leave-planner/MASTER_EMPLOYEE?$filter=(EMAIL_ID eq '" + sUserId + "')";
			$.ajax({
				url: path,
				type: 'GET',
				contentType: 'application/json',
				success: function (oData, response) {
					
					sap.ui.getCore().getModel("userAttriJson").setProperty("/CASUAL_LEAVE_BALANCE", Number(oData.value[0].CASUAL_LEAVE_BALANCE));
					sap.ui.getCore().getModel("userAttriJson").setProperty("/DESIGNATION", oData.value[0].DESIGNATION);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/EMAIL_ID", oData.value[0].EMAIL_ID);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/EMPLOYEE_ID", oData.value[0].EMPLOYEE_ID);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/EMPLOYEE_NAME", oData.value[0].EMPLOYEE_NAME);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/GENERAL_LEAVE_BALANCE", Number(oData.value[0].GENERAL_LEAVE_BALANCE));
					sap.ui.getCore().getModel("userAttriJson").setProperty("/MOBILE_NO", oData.value[0].MOBILE_NO);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/PROJECT", oData.value[0].PROJECT);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/REPORTING_LEAD", oData.value[0].REPORTING_LEAD);
					sap.ui.getCore().getModel("userAttriJson").setProperty("/REPORTING_MANAGER", oData.value[0].REPORTING_MANAGER);

					context.onRead(sap.ui.getCore().getModel("userAttriJson").getData().EMPLOYEE_ID, msg);
				},
				error: function (oError) {
					
					MessageBox.error("Error");
				}
			});
		},

		onRead: function (empID, msg) {
			
			var path;
			var designation = sap.ui.getCore().getModel("userAttriJson").getProperty("/DESIGNATION");
			var EmpName = sap.ui.getCore().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME");
			// if (designation === 'Lead Consultant') {
			// 	path = appModulePath + "/odata/v4/team-leave-planner/TEAM_LEAVE_INFO?$expand=TO_EMPLOYEE&$filter=(LEAVE_STATUS eq 1) and (IS_DELETED eq null) and (TO_EMPLOYEE/REPORTING_LEAD eq '" +EmpName +"')";
			// }
			
			const oBinding = context.base.getView().getContent()[0].getContent().getRowBinding();

			var EmpName = sap.ui.getCore().getModel("userAttriJson").getProperty("/EMPLOYEE_NAME");
			
			if (designation === 'Lead Consultant') {
				const oFilter1 = new sap.ui.model.Filter("LEAVE_STATUS", sap.ui.model.FilterOperator.EQ, 1);
				const oFilter2 = new sap.ui.model.Filter("TO_EMPLOYEE/REPORTING_LEAD", sap.ui.model.FilterOperator.EQ, EmpName);
				const oFilter3 = new sap.ui.model.Filter("IS_DELETED", sap.ui.model.FilterOperator.EQ, null);
				oBinding.filter([oFilter1, oFilter2, oFilter3]);
			} else if (designation === 'Manager') {
				const oFilter1 = new sap.ui.model.Filter("LEAVE_STATUS", sap.ui.model.FilterOperator.EQ, 2);
				const oFilter2 = new sap.ui.model.Filter("TO_EMPLOYEE/REPORTING_MANAGER", sap.ui.model.FilterOperator.EQ, EmpName);
				const oFilter3 = new sap.ui.model.Filter("IS_DELETED", sap.ui.model.FilterOperator.EQ, null);
				oBinding.filter([oFilter1, oFilter2, oFilter3]);
			}
			
        }
	});
});
