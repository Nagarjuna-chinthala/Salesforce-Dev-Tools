const packageMetadataMap = new Map(
    [['Apex Class', 'ApexClass'],
    ['ApexComponent','ApexComponent'],
    ['vf page','ApexPage'],
    ['Apex Trigger', 'ApexTrigger'],
    ['Aura component', 'AuraDefinitionBundle'],
    ['lwc', 'LightningComponentBundle'], 
    ['Profiles', 'Profile'],
    ['QuickActions', 'QuickAction'],
    ['Assignment Rules', 'AssignmentRules'],
    ['Role','Role'],
    ['Custom Metadata','CustomMetadata'],
    ['Custom Labels','CustomLabels'], 
    ['Custom Object','CustomObject'],
    ['Custom Field','CustomField'],
    ['Remote SiteSetting','RemoteSiteSetting'],
    ['Queue','Queue'],
    ['Permission Set','PermissionSet'],
    ['Layout', 'Layout']
]);

// export modules for availability 
module.exports = {
    packageMetadataMap
};