# zombie-server

A REST-like HTTP server for accessing Zombie.js sessions, the main target of
this library is when you want to plug zombie.js into a testing framework for a
language or development stack which is not NodeJS based. And to provide a clean
interface for interacting with zombie.js sessions.

This is a very early work in progress, and as such probably doesn't work yet.

## Goals

 * Clean RESTful interface supporting all Zombie.js features
 * Make it easy to consume said interface

## TODO

Almost everything, but specifically:

 * Figure out how to assert HTML content cleanly

## Usage

See http://zombie.labnotes.org/api.html for more details

Planned URL layout:

    * All request bodies to be application/json
    * All response bodies to be application/hal+json

    GET /browsers                   list all active sessions
        keys in response
            browsers        array of browser URIs
    DELETE /browsers                purge all active sessions
    POST /browsers                  create new session (202 + redirect)
        body parameters
            requires location    start from this URL
            OR
            requires id          fork the browser with given id
            optional debug
            optional runScripts
            optional userAgent

    DELETE /browsers/:id            delete session
    GET /browsers/:id               get state of session
        keys in response
            code            HTTP response
            location        current url
            redirected      boolean

    GET /browsers/:id/code          get HTTP response code
        keys in response
            code            HTTP response

    GET /browsers/:id/location      get current URL
        keys in response
            location            current url
    PUT /browsers/:id/location      set current URL (navigates to new page)
        body parameters
            requires location   new URL

    GET /browsers/:id/cookies               list of cookies
    DELETE /browsers/:id/cookies            delete all cookies
    GET /browsers/:id/cookies/:cookie       get one cookie by name
    DELETE /browsers/:id/cookies/:cookie    delete cookie by name

    GET /browsers/:id/html          get HTML of currently rendered page
        url parameters
            optional selector   CSS selector
            optional context    CSS selector for element to search within
        keys in response
            html                the requested HTML

    GET /browsers/:id/text          get text of currently rendered page
        url parameters
            optional selector   CSS selector
            optional context    CSS selector for element to search within
        keys in response
            text                the requested text

    GET /browsers/:id/css           Evaluate a CSS expression
        url parameters
            required selector   CSS selector
            optional context    CSS selector for element to search within
        keys in repsonse
            nodes               List of HTML fragments

    GET /browsers/:id/xpath         Evaluate an XPath expression
        url parameters
            required xpath      XPath query
            optional context    XPath query for element
        keys in repsonse
            TODO: figure this out

    POST /browsers/:id/evaluate
        body parameters
            required javascript
    POST /browsers/:id/interations  interact with the page
        TODO: decide how this will work
