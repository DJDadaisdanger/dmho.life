1. **Explore `p5.js` context for `vAmbientColor`**:
   - `phongVert` defines `varying vec3 vAmbientColor` and accumulates ambient light into it inside `main()`.
   - `phongFrag` declares `varying vec3 vAmbientColor` and uses it in `gl_FragColor`.
   - `p5.RendererGL.prototype._setFillUniforms` sets the ambient light uniforms but has a `// TODO: sum these here...` for `this.ambientLightColors`.

2. **Modify `phongVert`**:
   - Remove `varying vec3 vAmbientColor;` and the loop that computes `vAmbientColor`.
   - Remove `uniform vec3 uAmbientColor[5];` and `uniform int uAmbientLightCount;` as they are no longer used in `phongVert`.

3. **Modify `phongFrag`**:
   - Replace `varying vec3 vAmbientColor;` with `uniform vec3 vAmbientColor;`.

4. **Modify `_setFillUniforms` in `p5.js`**:
   - Compute the sum of `this.ambientLightColors`.
   - Pass the sum to `fillShader.setUniform('vAmbientColor', <computed_sum>);`.

5. **Pre-commit step**:
   - Complete pre-commit steps to make sure proper testing, verifications, reviews and reflections are done.

6. **Submit**:
   - Submit the changes using the `submit` tool.
