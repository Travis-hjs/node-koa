const style = `
<style>
*{ padding: 0; margin: 0; }
div { background: orange; margin-bottom: 10px; color: #fff; padding: 4px 8px; font-size: 18px; }
</style>
`
const content = `
<div>1</div>
<div>2</div>
<div>3</div>
<div>4</div>
<div>5</div>
<div>6</div>
`
/** 页面内容 */
const html = (style + content).replace(/\n/g, '');

export default html;