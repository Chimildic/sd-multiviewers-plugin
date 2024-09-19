SDPIComponents.i18n.locales = {
    en: {
        channelName: 'Channel',
        channelNamePlaceholder: 'e.g. igorghk',
        iconColor: 'Icon color',
        textColor: 'Text color',
        backgroundColor: 'Background color',
        btnConnectTwitch: 'Connect to Twitch',
    },
};

function connectTo(platform) {
    SDPIComponents.streamDeckClient.send('sendToPlugin', { platform })
}