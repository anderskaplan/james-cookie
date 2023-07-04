const SECONDS_PER_YEAR = 365 * 24 * 3600

function reverseDomain(domain) {
    return domain.split(".").toReversed().join(".")
}

function compareCookieDomains(a, b) {
    var delta = reverseDomain(a.domain).localeCompare(reverseDomain(b.domain))
    if (delta === 0)
        delta = a.path.localeCompare(b.path)
    if (delta === 0)
        delta = a.name.localeCompare(b.name)
    return delta
}

function compareCookieNames(a, b) {
    var delta = a.name.localeCompare(b.name)
    if (delta === 0)
        delta = reverseDomain(a.domain).localeCompare(reverseDomain(b.domain))
    if (delta === 0)
        delta = a.path.localeCompare(b.path)
    return delta
}

function compareCookieExpirationTimes(a, b) {
    return (a.expirationDate ?? 0) - (b.expirationDate ?? 0)
}

function formatCookieValue(cookie) {
    if (cookie.value.startsWith("ey")) {
        try {
            return atob(cookie.value.split("%")[0])
        }
        catch (error) { }
    }

    if (cookie.value.startsWith("%7B") || cookie.value.startsWith("%7b")) {
        try {
            return decodeURIComponent(cookie.value)
        }
        catch (error) { }
    }

    if (cookie.value.startsWith("{") && cookie.value.includes("%22")) {
        try {
            return decodeURIComponent(cookie.value)
        }
        catch (error) { }
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

function getAllCookies() {
    // return all cookies from all cookie stores as a `Promise<Cookie[]>`.
    return chrome.cookies.getAllCookieStores()
        .then((cookieStores) => {
            const requests = []
            cookieStores.forEach((store) => requests.push(chrome.cookies.getAll({ "storeId": store.id })))
            return Promise.allSettled(requests)
                .then((promises) => {
                    return promises.map((p) => p.value)
                })
        })
        .then((cookieArrays) => {
            var result = []
            cookieArrays.forEach((a) => result = result.concat(a))
            return result
        })
}

function renderCookies(cookies) {
    const tableBodyNode = document.querySelector("#cookie-table tbody")
    tableBodyNode.innerHTML = ""

    cookies.forEach(cookie => {
        const expiration = (cookie.expirationDate) ? new Date(cookie.expirationDate * 1000).toISOString().split("T")[0] : ""
        const value = formatCookieValue(cookie)
        const rowNode = document.createElement("tr")
        rowNode.innerHTML = "<td>" + cookie.domain + "</td><td>" + cookie.path + "</td><td>" + cookie.name + "</td><td>" + expiration + "</td><td>" + value + "</td>"
        classifyCookie(cookie).forEach(cls => rowNode.classList.add(cls))
        tableBodyNode.appendChild(rowNode)
    })

    updateVisibility()
}

var allCookies = []

function sortAndRender(headerId, sortFunction) {
    document.querySelectorAll("th[id]").forEach((headingNode) => {
        if (headingNode.getAttribute("id") === headerId) {
            headingNode.classList.add("sort")
        }
        else {
            headingNode.classList.remove("sort")
        }
    })

    allCookies.sort(sortFunction)
    renderCookies(allCookies)
}

getAllCookies()
    .then((cookies) => {
        allCookies = cookies
        sortAndRender("heading-domain", compareCookieDomains)
    })

document.querySelectorAll("input[type=checkbox]").forEach(input => {
    input.addEventListener("click", updateVisibility)
})

document.getElementById("heading-domain")
    .addEventListener("click", () => sortAndRender("heading-domain", compareCookieDomains))
document.getElementById("heading-name")
    .addEventListener("click", () => sortAndRender("heading-name", compareCookieNames))
document.getElementById("heading-expiration")
    .addEventListener("click", () => sortAndRender("heading-expiration", compareCookieExpirationTimes))
