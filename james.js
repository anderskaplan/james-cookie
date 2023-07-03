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

function formatCookieValue(cookie) {
    if (cookie.value.startsWith("ey")) {
        try {
            return atob(cookie.value.split("%")[0])
        }
        catch (error) {}
    }

    if (cookie.value.startsWith("%7B") || cookie.value.startsWith("%7b")) {
        try {
            return decodeURIComponent(cookie.value)
        }
        catch (error) {}
    }

    if (cookie.value.startsWith("{") && cookie.value.includes("%22")) {
        try {
            return decodeURIComponent(cookie.value)
        }
        catch (error) {}
    }

    return cookie.value
}

const USER_ID_REGEX = /(u|user|visitor|subject)[_-]?id/i

function classifyCookie(cookie) {
    const classes = []

    if (cookie.name.startsWith("_ga") && cookie.value.startsWith("G")) {
        classes.push("google-analytics")
    }
    else if (cookie.name.startsWith("_hjSessionUser")) {
        classes.push("hotjar")
    }
    else if (USER_ID_REGEX.test(cookie.name)) {
        classes.push("uid")
    }
    else {
        classes.push("other")
    }

    if (cookie.value.startsWith("ey") || cookie.value.startsWith("%7B") || cookie.value.startsWith("%7b") || cookie.value.startsWith("{")) {
        classes.push("json")
    }
    else {
        classes.push("other-data")
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
                const value = formatCookieValue(cookie)
                const item = document.createElement("tr")
                item.innerHTML = "<td>" + cookie.domain + "</td><td>" + cookie.path + "</td><td>" + cookie.name + "</td><td>" + expiration + "</td><td>" + value + "</td>"
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
