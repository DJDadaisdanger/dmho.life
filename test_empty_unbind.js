const fs = require('fs');
let p5 = fs.readFileSync('p5.js', 'utf8');

// The unbindTextures function to test
const newUnbindTextures = `_main.default.Shader.prototype.unbindTextures = function() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;
            try {
              for (
                var _iterator = this.samplers[Symbol.iterator](), _step;
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
              ) {
                var uniform = _step.value;
                var tex = uniform.texture;
                if (tex) {
                  this.setUniform(uniform.name, this._renderer._getEmptyTexture());
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          };`;

console.log(newUnbindTextures);
