var conf = {
    siteTitle: "alopuapi",
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