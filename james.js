chrome.cookies.getAllCookieStores()
    .then((cookieStores) => {
        var list = document.getElementById("cookie-stores");
        cookieStores.forEach((store) => {
            chrome.cookies.getAll({ "storeId": store.id })
                .then((cookies) => {
                    cookies.forEach((cookie) => {
                        var item = document.createElement("li");
                        item.innerHTML = cookie.domain;
                        list.appendChild(item);
                    });
                });
        });
    });
