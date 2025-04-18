import { load } from 'cheerio';
import fetch from 'node-fetch';

/**
 * Component navigation item interface
 */
interface ComponentItem {
  name: string;
  url: string;
  index: number;
}

/**
 * Component documentation interface
 */
interface ComponentDocumentation {
  name: string;
  url: string;
  content: string;
}

/**
 * 从URL获取HTML内容并提取关键内容
 * @param {string} url - 要获取内容的URL
 * @returns {Promise<string>} - 提取的HTML内容
 */
export async function extractContent(url: string): Promise<string> {
  try {
    // 获取远程HTML内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch HTML: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('HTML content fetched successfully');

    // 使用cheerio加载HTML
    const $ = load(html);
    console.log('HTML loaded into cheerio');

    // 尝试查找主要内容
    let content = $('.vp-doc').html();

    // 如果找不到主要内容，尝试替代选择器
    if (!content) {
      console.log('Could not find main content with .vp-doc selector, trying alternatives');
      content = $('main .content-container').html();
      
      // 如果还是找不到，返回整个body内容
      if (!content) {
        console.log('Could not find specific content, returning body content');
        content = $('body').html();
      }
    } else {
      console.log('Main content found!');
    }

    return content || '';
  } catch (error) {
    console.error('Error extracting content:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}


/**
 * 解析HTML中的导航栏组件列表，只提取UI组件
 * @param {string} url - 要获取内容的URL
 * @returns {Promise<Array<ComponentItem>>} 包含组件信息的数组
 */
export async function extractNavigation(url: string): Promise<ComponentItem[]> {
  try {
    // 获取远程HTML内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch HTML: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('HTML content fetched successfully');

    // 使用cheerio加载HTML
    const $ = load(html);
    console.log('HTML loaded into cheerio');

    // 组件数组
    const allItems: ComponentItem[] = [];

    // 尝试几种可能的导航栏选择器
    // 方法1: 寻找侧边栏导航元素
    const sidebarLinks = $('.VPSidebarNav .VPLink, .sidebar .sidebar-link');
    
    if (sidebarLinks.length > 0) {
      console.log(`Found ${sidebarLinks.length} sidebar links`);
      
      sidebarLinks.each((i, el) => {
        const $el = $(el);
        const name = $el.text().trim();
        const url = $el.attr('href');
        
        if (name && url) {
          allItems.push({
            name,
            url,
            index: i
          });
        }
      });
    } else {
      // 方法2: 寻找菜单项
      console.log('Trying alternative selectors for navigation');
      const menuItems = $('.menu-item, .nav-item a, nav a');
      
      if (menuItems.length > 0) {
        console.log(`Found ${menuItems.length} menu items`);
        
        menuItems.each((i, el) => {
          const $el = $(el);
          const name = $el.text().trim();
          const url = $el.attr('href');
          
          if (name && url) {
            allItems.push({
              name,
              url,
              index: i
            });
          }
        });
      } else {
        console.log('No navigation elements found');
      }
    }

    // 过滤出UI组件 - 只保留 /components/ 路径下的且非文档导航类的项目
    const components = allItems.filter(item => {
      // 排除导航项
      if (
        item.name === '介绍' || 
        item.name === '安装' || 
        item.name === '配置' || 
        item.name === '快速上手' || 
        item.name === '内置样式' || 
        item.name === '注意事项' || 
        item.name === '加群交流反馈' ||
        item.name.startsWith('上一篇') || 
        item.name.startsWith('下一篇')
      ) {
        return false;
      }
      
      // 只保留组件相关路径的项目，并且不是导航相关的文档页
      return (
        item.url.includes('/components/') && 
        !item.url.endsWith('install.html') && 
        !item.url.endsWith('intro.html') && 
        !item.url.endsWith('setting.html') && 
        !item.url.endsWith('quickstart.html') && 
        !item.url.endsWith('common.html') && 
        !item.url.endsWith('feature.html') &&
        !item.url.endsWith('addQQGroup.html')
      );
    });

    console.log(`Extracted ${components.length} UI components`);
    return components;
  } catch (error) {
    console.error('Error extracting components:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * 获取特定组件的文档
 * @param {string} baseUrl - 包含组件导航的页面URL
 * @param {string} componentName - 目标组件名称
 * @returns {Promise<ComponentDocumentation>} - 包含组件文档内容和元数据的对象
 */
export async function getComponentDocumentation(baseUrl: string, componentName: string): Promise<ComponentDocumentation> {
  try {
    console.log(`Searching for component: ${componentName}`);
    
    // 1. 获取所有组件列表
    const components = await extractNavigation(baseUrl);
    if (!components || components.length === 0) {
      throw new Error('No components found in the navigation');
    }
    
    console.log(`Found ${components.length} components in navigation`);
    
    // 2. 查找匹配的组件 - 支持模糊匹配和不区分大小写
    const targetComponent = components.find(comp => {
      return comp.name.toLowerCase().includes(componentName.toLowerCase());
    });
    
    if (!targetComponent) {
      throw new Error(`Component "${componentName}" not found in the navigation`);
    }
    
    console.log(`Found matching component: ${targetComponent.name} at ${targetComponent.url}`);
    
    // 3. 构建完整的组件URL
    let componentUrl = targetComponent.url;
    
    // 如果URL是相对路径，需要拼接基础URL
    if (!componentUrl.startsWith('http')) {
      // 提取基础URL的域名部分
      const baseUrlObj = new URL(baseUrl);
      const baseOrigin = baseUrlObj.origin;
      
      // 如果URL以/开头，则直接拼接域名，否则需要考虑路径
      if (componentUrl.startsWith('/')) {
        componentUrl = `${baseOrigin}${componentUrl}`;
      } else {
        // 移除baseUrl中的文件名，只保留路径
        const basePath = baseUrlObj.pathname.substring(0, baseUrlObj.pathname.lastIndexOf('/') + 1);
        componentUrl = `${baseOrigin}${basePath}${componentUrl}`;
      }
    }
    
    console.log(`Fetching component documentation from: ${componentUrl}`);
    
    // 4. 获取组件文档内容
    const content = await extractContent(componentUrl);
    
    // 5. 返回组件信息和内容
    return {
      name: targetComponent.name,
      url: componentUrl,
      content: content
    };
  } catch (error) {
    console.error('Error getting component documentation:', error instanceof Error ? error.message : String(error));
    throw error;
  }
} 