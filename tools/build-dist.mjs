// Builds both Firebase Hosting folders from this repo.
//   node tools/build-dist.mjs OUTDIR
// Needs two JSON secrets in the environment (never in the repo):
//   CONFIG_LOCAL_JSON  {"firebase":{...},"driveApiKey":"","sharedFolderIds":[]}
//   PERSONAL_JSON      {"libFolder","presFolder","sharedFolder","guestTeacher"}  (optional: owner's legacy account only)
// Output: OUTDIR/legacy (old address, app at root) and OUTDIR/cb (classroomboard site).
import fs from 'fs';
import path from 'path';
import {build} from 'esbuild';
import {execSync} from 'child_process';

const out = path.resolve(process.argv[2] || 'dist');
const cfg = JSON.parse(process.env.CONFIG_LOCAL_JSON || '{}');
if (!cfg.firebase || !cfg.firebase.apiKey) throw new Error('CONFIG_LOCAL_JSON missing or incomplete');
const pers = process.env.PERSONAL_JSON ? JSON.parse(process.env.PERSONAL_JSON) : null;

const cp = (a, b) => fs.cpSync(a, b, {recursive: true});
fs.rmSync(out, {recursive: true, force: true});
const legacy = path.join(out, 'legacy'), cb = path.join(out, 'cb');
fs.mkdirSync(legacy, {recursive: true});
fs.mkdirSync(cb, {recursive: true});

// 1. App: copy, bundle the Firebase layer, restore the owner's personal values
cp('app', legacy);
fs.writeFileSync('config.local.json', JSON.stringify(cfg));
await build({entryPoints: ['cloud-src.js'], bundle: true, minify: true, format: 'iife', outfile: path.join(legacy, 'cloud.js'), logLevel: 'error'});
fs.rmSync('config.local.json');
if (pers) {
  const edit = (f, pairs) => {
    const p = path.join(legacy, f);
    let s = fs.readFileSync(p, 'utf8');
    for (const [a, b] of pairs) {
      if (!s.includes(a)) throw new Error('pattern not found in ' + f + ': ' + a.slice(0, 40));
      s = s.split(a).join(b);
    }
    fs.writeFileSync(p, s);
  };
  edit('app.js', [
    ["driveBrowser((window.__PERSONAL||{}).libFolder||'root'", "driveBrowser('" + pers.libFolder + "'"],
    ["driveBrowser((window.__PERSONAL||{}).presFolder||'root'", "driveBrowser('" + pers.presFolder + "'"],
    ...(pers.guestTeacher ? [["מורה אורח", pers.guestTeacher]] : []),
  ]);
  edit('drive-ui.js', [["SB=window.__legacy?(window.__PERSONAL||{}).sharedFolder||'':'root';", "SB=window.__legacy?'" + pers.sharedFolder + "':'root';"]]);
}

// 2. classroomboard site: landing, pages, cast and remote bundles, developer hub
cp('landing', cb);
cp(legacy, path.join(cb, 'app'));
for (const d of ['cast', 'cast-board', 'remote', 'cast-proto']) cp(path.join('cast-pages', d), path.join(cb, d));
fs.mkdirSync(path.join(cb, 'cast-lib'), {recursive: true});
cp('cast-pages/cast.css', path.join(cb, 'cast-lib', 'cast.css'));
for (const [src, dst] of [['cast-src/sig.js', 'sig.js'], ['cast-src/rem.js', 'rem.js']]) {
  const tmp = src.replace('.js', '.tmp.js');
  fs.writeFileSync(tmp, fs.readFileSync(src, 'utf8').split("apiKey:'REDACTED'").join("apiKey:'" + cfg.firebase.apiKey + "'").split('__CFG__').join(JSON.stringify(cfg.firebase)));
  await build({entryPoints: [tmp], bundle: true, minify: true, format: 'iife', outfile: path.join(cb, 'cast-lib', dst), logLevel: 'error'});
  fs.rmSync(tmp);
}
const gen = fs.readFileSync('developer-src/gen.py', 'utf8').replace("OUT='/tmp/fb/public-cb/developer'", "OUT='" + path.join(cb, 'developer') + "'");
fs.mkdirSync(path.join(cb, 'developer'), {recursive: true});
fs.writeFileSync('/tmp/gen-ci.py', gen);
execSync('python3 /tmp/gen-ci.py', {stdio: 'inherit'});
console.log('built', out);
