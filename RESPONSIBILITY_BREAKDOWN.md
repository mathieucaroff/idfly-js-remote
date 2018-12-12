# Responsiblity Breakdown

This file describe what responsiblity is associated with what source file. It's also a description of the structure of the project.


## Non-JS

<dl>
<dt>asset/</dt>
<dd>Contains all non-text files or files not meant to be read as text.</dd>

## JS

<dt>src/assets</dt>
<dd>
Contains source files related to files in `asset/`, as well as files with generated conent.

<dl>
<dt>airshipBlueprint.js</dt>
<dd>Informations about the .svg file, especially the locations of each clickable area.</dd>

<dt>colorGradient.js</dt>
<dd>Contains generated css for gradients.</dd>

<dt>cssnormalize.js</dt>
<dd>The JS file associated with normalize.css. It contains it's location.</dd>

<dt>font.js</dt>
<dd>The JS file associated with the font file(s) in `asset/`. It contains the CSS
needed to use those. (I don't know why it actually doesn't works.)</dd>

</dl></dd>

<dt>src/util/</dt>
<dd>
Contains JS files that may be reused in other projects.

<dl>
<dt>assert.js</dt>
<dd>Function(s) to write tests.</dd>

<dt>Box.js</dt>
<dd>Class to manipulate rectangular, aligned areas.
Depends on simpleClass.js</dd>

<dt>futil.js</dt>
<dd>A bunch of JS, DOM and Network functions.</dd>
</dl></dd>

<dt>src/errors.js</dt>
<dd>The error names used in the project.</dd>

<dt>src/simpleClass.js</dt>
<dd>A helper function to create DRY class with fluent interface.
A bit buggy when used outside the simplest use cases.</dd>

<dt>src/LimitRate.js</dt>
<dd>(copy-pasta) Given a function, prevent it being executed too often
by delaying such executions. Some executions may be skipped. At the time
the function can be executed again, the argument from the last execution
request will be used.</dd>

<dt>src/Periodic.js</dt>
<dd>Execute a function periodically after `.start()` was called, until
`.stop()` is called.</dd>

<dt>src/index.js<dt>
<dd>Entry point. Executes either removeV2.js (default) or removeV1.js
(if url ends in `#1`).</dd>

<dt>src/remoteV1.js</dt>
<dd>Old remote. Depends only on `src/asset/` files and `src/util/futil.js`.</dd>

<dt>src/remoteV2.js</dt>
<dd>Loads the page, instanciate the dependencies and setup the event
listeners.</dd>

<dt>src/Motors.js</dt>
<dd>The interface with the server, to control the motors remotely.</dd>

</dl>