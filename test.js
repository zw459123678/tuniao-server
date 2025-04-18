

import { extractNavigation, extractContent } from './extract-content.js';
   
async function main() {
  try {
    const components = await extractNavigation('https://vue2.tuniaokj.com/components/keyboard.html');
    console.log('获取到的组件列表:', components);
    // 进一步处理组件列表...
    const str = components.map((item) => `${item.name} - https://vue2.tuniaokj.com${item.url}`).join("\n");
    console.log(str);
  } catch (error) {
    console.error('获取组件列表失败:', error);
  }
}

main();