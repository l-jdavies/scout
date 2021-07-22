const SUBSCRIPTION_SUBJECTS = {
	ruleset : {
		fullSubject : 'DATA.FullRuleSetRequest',
		streamName  : 'DATA',
		subsetName  : 'FullRuleSet'
	},
	sdkKey  : {
		fullSubject : 'KEY.sdkKeyRequest',
		streamName  : 'KEY',
		subsetName  : 'sdkKey'
	}
};

module.exports.ruleset = SUBSCRIPTION_SUBJECTS.ruleset;
module.exports.sdkKey = SUBSCRIPTION_SUBJECTS.sdkKey;
