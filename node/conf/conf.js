var conf = {
    siteTitle: "agora",
    port: 9999,
    sources: [
        { 
            source: 'facebook',
            edges: ["likes", "sharedposts", "attachments", "reactions", "comments"]
        }
    ],
    hardRealms: ['all']
}
module.exports = conf