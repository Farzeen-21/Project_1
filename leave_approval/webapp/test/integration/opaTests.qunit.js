sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/ibspl/leaveapproval/test/integration/FirstJourney',
		'com/ibspl/leaveapproval/test/integration/pages/TEAM_LEAVE_INFOList',
		'com/ibspl/leaveapproval/test/integration/pages/TEAM_LEAVE_INFOObjectPage'
    ],
    function(JourneyRunner, opaJourney, TEAM_LEAVE_INFOList, TEAM_LEAVE_INFOObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/ibspl/leaveapproval') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheTEAM_LEAVE_INFOList: TEAM_LEAVE_INFOList,
					onTheTEAM_LEAVE_INFOObjectPage: TEAM_LEAVE_INFOObjectPage
                }
            },
            opaJourney.run
        );
    }
);