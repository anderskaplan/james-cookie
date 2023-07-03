function reverseDomain(domain) {
    return domain.split(".").toReversed().join(".")
}

function cookieCompare(a, b) {
    var delta = reverseDomain(a.domain).localeCompare(reverseDomain(b.domain))
    if (delta === 0)
        delta = a.path.localeCompare(b.path)
    if (delta === 0)
        delta = a.name.localeCompare(b.name)
    return delta
}

chrome.cookies.getAllCookieStores()
    .then((cookieStores) => {
        const rootNode = document.getElementById("cookie-stores")

        cookieStores.forEach((store) => {
            const storeNode = document.createElement("div")
            storeNode.innerHTML = "<h2>Cookie store \"" + store.id + "\"</h2>"
            rootNode.appendChild(storeNode)

            const tableNode = document.createElement("table")
            tableNode.innerHTML = "<thead><tr><th scope='col'>Domain</th><th scope='col'>Path</th><th scope='col'>Name</th><th scope='col'>Expiration</th><th scope='col'>Value</th></tr></thead>"
            storeNode.appendChild(tableNode)

            chrome.cookies.getAll({ "storeId": store.id })
                .then((cookies) => {
                    cookies.sort(cookieCompare)
                    cookies.forEach((cookie) => {
                        const expiration = (cookie.session) ? "session" : new Date(cookie.expirationDate * 1000).toISOString().split("T")[0]
                        const item = document.createElement("tr");
                        item.innerHTML = "<td>" + cookie.domain + "</td><td>" + cookie.path + "</td><td>" + cookie.name + "</td><td>" + expiration + "</td><td>" + cookie.value + "</td>"
                        tableNode.appendChild(item);
                    });
                });
        });
    });
