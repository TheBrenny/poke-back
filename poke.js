#!/usr/bin/env node

const yargs = require("yargs")(process.argv.slice(2))
    .scriptName("pokeback")
    .command("$0 [username|email] [password]", "Create a pokeback instance using an optional username and password", (y) => {
        return y.positional("username", {
                alias: "email",
                desc: "The username/email to login with. Can be omitted and entered via STDIN.",
                type: "string",
            })
            .positional("password", {
                desc: "The password to login with. Can be omitted and entered via STDIN.",
                implies: "username",
                type: "string"
            })
            .option("ignore", {
                array: true,
                type: "string",
                alias: ["i"],
                desc: "Names of those that you don't wish to poke back.",
                conflicts: "exactly"
            })
            .option("exactly", {
                array: true,
                type: "string",
                alias: ["e"],
                desc: "Names of that that you ONLY wish to poke back.",
                conflicts: "ignore"
            })
            .option("timeout", {
                type: "number",
                alias: ["t"],
                desc: "The number of seconds before another poke attempt is made.",
                default: 5
            })
            .option("debug", {
                type: "boolean",
                hidden: true,
                desc: "Makes the puppeteer instance have a head."
            });
    }).argv;

const rl = require("readline-sync");
const puppeteer = require("puppeteer");

async function text(el) {
    return await el.evaluate(e => e.textContent);
}
async function doLogin(user, pass, page) {
    if (user == null) user = rl.question("username: ");
    if (pass == null) pass = rl.question("password: ", {
        hideEchoBack: true
    });

    const form = await page.$("#login_form");
    const emailBox = await form.$("#email");
    const passBox = await form.$("#pass");
    const loginBtn = await form.$("#loginbutton");

    const scrollIntoView = (el) => el.evaluate((e) => e.scrollIntoView());

    await scrollIntoView(emailBox);
    await emailBox.click();
    await emailBox.type(user);

    await scrollIntoView(passBox);
    await passBox.click();
    await passBox.type(pass);

    await page.waitForTimeout(500);

    await scrollIntoView(loginBtn);
    await loginBtn.hover();
    await loginBtn.click();

    await page.waitForNavigation({
        waitUntil: "networkidle2"
    });

    return await page.$("#login_form") === null;
}

const ignore = yargs.ignore || [];
const exactly = yargs.exactly || [];
const domTargets = {
    name: "a.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p",
    btn: "parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children",
};
const getBtn = (e, btnPath) => (console.log(e), console.log(btnPath), btnPath.split(".").reduce((a, c) => a[c], e)[1]);
async function pokeBack(page) {
    process.stdout.write(".");

    let names = (await page.$$(domTargets.name));
    
    let btn;
    let poked = [];
    for (let n of names) {
        let ntc = await text(n);
        if (ignore.includes(ntc)) continue;

        if(exactly.length > 0 && !exactly.includes(ntc)) continue;

        btn = await n.evaluateHandle(getBtn, domTargets.btn);
        let pbtc = await text(btn);
        if (pbtc === "Poke Back") {
            poked.push(ntc);
            await btn.click();
        }
    }
    if(poked.length) console.log("\nPoking " + poked.join(" and ") + ".");

    setTimeout(pokeBack.bind(this, page), yargs.timeout * 1000);
}


if (require.main === module) {
    (async () => {
        let puppet = await puppeteer.launch({
            headless: !yargs.debug,
            defaultViewport: {
                width: 1200,
                height: 800
            },
        });
        let page = (await puppet.pages())[0];
        await page.goto("https://www.facebook.com/pokes", {
            waitUntil: "networkidle2"
        });

        let user = yargs.username || null;
        let pass = yargs.password || null;

        if (await page.$("#login_form") !== null) {
            while (!(await doLogin(user, pass, page))) {
                console.error("Login failed. Try again.");
                // nullify to have the prompt ask for details
                user = null;
                pass = null;
            }
        }

        if (ignore.length > 0) console.log("Ignoring:\n  " + ignore.join("\n  "));
        if (exactly.length > 0) console.log("Only poking:\n  " + exactly.join("\n  "));
        console.log("Running!");

        pokeBack(page);

        // once passed enter a loop to poke back every second or so.
    })();
}

module.exports = {};