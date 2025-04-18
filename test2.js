import { getComponentDocumentation } from './extract-content.js';

async function main() {
  try {
    const baseUrl = 'https://vue2.tuniaokj.com/components/setting.html'; // 包含导航的页面
    const componentName = 'Code'; // 要查找的组件名称
    
    const result = await getComponentDocumentation(baseUrl, componentName);
    
    console.log(`组件名称: ${result.name}`);
    console.log(`组件URL: ${result.url}`);
    console.log(`内容长度: ${result.content.length}`);
    console.log(`内容片段: ${result.content.substring(0, 1000)}...`);
    
    // 可以进一步处理组件内容，例如保存到文件
    // fs.writeFileSync(`${result.name}.html`, result.content, 'utf8');
  } catch (error) {
    console.error('获取组件文档失败:', error.message);
  }
}

main();