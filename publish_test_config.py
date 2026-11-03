"""Creates or updates a separate, non-default TEF config whose startup script is loader.js.

python publish_test_config.py            list the site's TEF configs (no change)
python publish_test_config.py --apply    create/update the config "ghtools_test" and verify it through gettefconfig

The site and the login come from Election2026/publish_config.py: the session of the TerraExplorer
that is logged in to the site (cookie kept in memory only, never printed). The config is never made default.
"""
import json, os, sys, urllib.parse, urllib.request
sys.path.insert(0, r"D:\Private\Apps\TENew\Election2026")
import publish_config as pc

NAME = os.environ.get("TEST_CONFIG", "ghtools_test")
LOADER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "loader.js")


def main():
    cookie = pc.session()
    tc = pc.configs(cookie)
    for c in tc["tefDataList"]:
        print(f"  key={c['key']} name={c['name']!r} default={c['isDefault']} login={c['loginMode']} lang={c['language']}")
    if "--apply" not in sys.argv:
        return
    if NAME == "election":
        sys.exit("refusing to touch the public election config")
    code = open(LOADER, encoding="utf-8").read()
    mine = next((c for c in tc["tefDataList"] if c["name"] == NAME), None)
    default = next((c for c in tc["tefDataList"] if c["isDefault"]), None)
    langs = {o["key"].lower(): o["key"] for o in tc["tefLanguageOptions"]}
    data = {"name": NAME, "isDefault": False, "startupScript": code, "cssScript": "",
            "language": langs.get("en", "en"),
            "loginMode": (mine or default or {}).get("loginMode") or "none", "loginToken": "", "customLanguage": ""}
    if mine:
        data["key"] = mine["key"]
    r = pc.gql(cookie, "mutation($d: TefDataInput){UpdateSettingsTefData(SettingsTefDataInputDto: $d){successStatus errorMessage errorCode key}}",
               {"d": data})["UpdateSettingsTefData"]
    print("update:", json.dumps(r, ensure_ascii=False))
    if not r["successStatus"]:
        sys.exit(1)
    v = json.load(urllib.request.urlopen(pc.SITE + "/gettefconfig?name=" + urllib.parse.quote(NAME), context=pc.CTX, timeout=30))
    value = json.loads(v["Value"]) if isinstance(v.get("Value"), str) else v.get("Value") or {}
    print("gettefconfig:", v.get("Name"), "| startupScript matches loader.js:", (value.get("startupScript") or "") == code)
    d = json.load(urllib.request.urlopen(pc.SITE + "/gettefconfig?name=", context=pc.CTX, timeout=30))
    print("site default is still:", d.get("Name"))


if __name__ == "__main__":
    main()
