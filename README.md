James the Cookie Explorer
=========================
A Chrome plugin which lets you explore the cookies that web sites have stored
in your browser. In case you're curious.

## Installation
The plugin can be installed as an "unpacked extension" using the instructions
in the [plugin developer guide](
https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).

## Usage
After installation, click the extensions icon (the jigsaw puzzle piece) in
Chrome and select James Cookie. The plugin should open in a new tab.

The cookies are displayed in a table as follows:
- Domain: this is the domain (web address) of the web server which set the cookie.
- Path: the url path to which the cookie applies.
- Name: a name which identifies the cookie.
- Expiration date: the date until which the cookie is valid (optional).
- Value: the data held by the cookie. Base64-encoded JSON and uri encoded JSON
  is decoded automatically.

Use the checkboxes at the top to select which cookies to display in the table.

Click the headers in the table to change the sort order. Not all of them are
sortable. Note: domains are sorted with subdomains reversed; think "com.google.www"
instead of "www.google.com".

If you'd like to know more about the cookies you see, especially the more common
ones, then services like [the Cookie Database](https://cookiedatabase.org/) might
be able to help.
