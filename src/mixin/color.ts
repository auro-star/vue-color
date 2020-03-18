import Vue, { PropOptions }  from 'vue'
import tinycolor from 'tinycolor2';
import Component from 'vue-class-component';
import debounce from 'lodash.debounce';
import { DEFAULT_COLOR } from '../config';

// TODO: 枚举 & fallback
const supportFormat = ['hex', 'hex8']

// We declare the props separately
// to make props types inferable.
const Props = Vue.extend({
  props: {
    value: {
      // default: '#fff',
      // required: true,
      validator(value){ return tinycolor(value).isValid() }
    } as PropOptions<tinycolor.ColorInput>,
    outputFormat: {
      type: String,
      validator(value){ return supportFormat.indexOf(value) >= 0 }
    }
  }
})

// TODO: 枚举 & fallback
interface FormatMethodMap {
  [key: string]: 'toHexString' | 'toHex8String'
}
const formatMethodMap: FormatMethodMap = {
  hex: 'toHexString',
  hex8: 'toHex8String'
};

@Component
export default class Color extends Props {

  debounced = debounce((fn) => {
    fn()
  }, 100);

  // because default value is `#000`
  private _outputFormat: string = 'hex';

  get isInputEmpty() {
    return this.value === null;
  }
  // `tc` stands for tinycolor
  get tc () {
    if (this.value === null) {
      // TODO: warning, when outputFormat is undefined
      this._outputFormat = this.outputFormat;
      return new tinycolor(DEFAULT_COLOR);
    }
    const tc = new tinycolor(this.value);
    this._outputFormat = tc.getFormat();
    return tc;
  }
  getOutputFormat() {
    return this._outputFormat;
  }
  setOutputFormat(/*TODO: enum this type */format: string) {
    this._outputFormat = format;
  }

  onColorChange(value: tinycolor.ColorInput) {
    const tc = new tinycolor(value);
    // to support v-model
    this.$emit('input', tc);
    this.$emit('change', tc);
    this.debounced(() => { this.$emit('change-complete', tc) });

    // // to avoid precision lose, need to separate another method to provide identical output
    // let formatMethod = formatMethodMap[this._outputFormat];
    // if (formatMethod) {
    //   const formatted = tc[formatMethod]();
    //   this.$emit('identical-change', formatted);
    //   // this.debounced(() => this.$emit('identical-change-complete', tc));
    // }
  }
  equals(color: tinycolor.ColorInput) {
    if (this.isInputEmpty) {
      return false;
    }
    return tinycolor.equals(this.tc, color);
  }
};

