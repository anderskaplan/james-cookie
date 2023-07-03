const SECONDS_PER_YEAR = 365 * 24 * 3600

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

function classifyCookie(cookie) {
    const classes = []

    const lowerCaseNameValue = (cookie.name + cookie.value).toLowerCase()
    if (cookie.name.startsWith("_ga") && cookie.value.startsWith("G")) {
        classes.push("google-analytics")
    }
    else if (lowerCaseNameValue.includes("uid") || lowerCaseNameValue.includes("userid")) {
        classes.push("uid")
    }
    else {
        classes.push("other")
    }

    if (cookie.expirationDate && cookie.expirationDate > Date.now() / 1000 + SECONDS_PER_YEAR) {
        classes.push("long")
    }
    else {
        classes.push("short")
    }

    return classes
}

function renderCookieStore(storeId) {
    const storeNode = document.createElement("div")
    storeNode.innerHTML = "<h2>Cookie store \"" + storeId + "\"</h2>"

    const tableNode = document.createElement("table")
    tableNode.innerHTML = "<thead><tr><th scope='col'>Domain</th><th scope='col'>Path</th><th scope='col'>Name</th><th scope='col'>Expiration</th><th scope='col'>Value</th></tr></thead>"
    storeNode.appendChild(tableNode)

    chrome.cookies.getAll({ "storeId": storeId })
        .then(cookies => {
            cookies.sort(cookieCompare)
            cookies.forEach(cookie => {
                const expiration = (cookie.expirationDate) ? new Date(cookie.expirationDate * 1000).toISOString().split("T")[0] : ""
                const item = document.createElement("tr")
                item.innerHTML = "<td>" + cookie.domain + "</td><td>" + cookie.path + "</td><td>" + cookie.name + "</td><td>" + expiration + "</td><td>" + cookie.value + "</td>"
                classifyCookie(cookie).forEach(cls => item.classList.add(cls))
                tableNode.appendChild(item)
            })
        })

    return storeNode
}

function updateVisibility() {
    const hidden = []
    document.querySelectorAll("input[type=checkbox]").forEach(input => {
        if (!input.checked) {
            hidden.push(input.name)
        }
    })

    document.querySelectorAll("tr").forEach(tr => {
        if (hidden.some(item => tr.classList.contains(item))) {
            tr.classList.add("hidden")
        }
        else {
            tr.classList.remove("hidden")
        }
    })
}

function renderAllCookieStores() {
    const rootNode = document.getElementById("cookie-stores")
    rootNode.innerHTML = ""

    chrome.cookies.getAllCookieStores()
        .then((cookieStores) => {
            cookieStores.forEach(store => {
                const storeNode = renderCookieStore(store.id)
                rootNode.appendChild(storeNode)
            })
        })

    updateVisibility()
}

document.querySelectorAll("input[type=checkbox]").forEach(input => {
    input.addEventListener("click", updateVisibility)
})

renderAllCookieStores()
