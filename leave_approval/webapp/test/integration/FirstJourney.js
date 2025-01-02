sap.ui.define([
    "sap/ui/test/opaQunit"
], function (opaTest) {
    "use strict";

    var Journey = {
        run: function() {
            QUnit.module("First journey");

            opaTest("Start application", function (Given, When, Then) {
                Given.iStartMyApp();

                Then.onTheTEAM_LEAVE_INFOList.iSeeThisPage();

            });


            opaTest("Navigate to ObjectPage", function (Given, When, Then) {
                // Note: this test will fail if the ListReport page doesn't show any data
                
                When.onTheTEAM_LEAVE_INFOList.onFilterBar().iExecuteSearch();
                
                Then.onTheTEAM_LEAVE_INFOList.onTable().iCheckRows();

                When.onTheTEAM_LEAVE_INFOList.onTable().iPressRow(0);
                Then.onTheTEAM_LEAVE_INFOObjectPage.iSeeThisPage();

            });

            opaTest("Teardown", function (Given, When, Then) { 
                // Cleanup
                Given.iTearDownMyApp();
            });
        }
    }

    return Journey;
});