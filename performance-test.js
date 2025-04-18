import { extractNavigation, getComponentDocumentation } from './extract-content.js';

/**
 * 测量函数执行时间的简单工具
 * @param {Function} fn - 要测量的异步函数
 * @param {Array} args - 传递给函数的参数数组
 * @returns {Promise<{result: any, duration: number}>} - 执行结果和持续时间(毫秒)
 */
async function measureExecutionTime(fn, args) {
  const start = Date.now();
  const result = await fn(...args);
  const duration = Date.now() - start;
  return { result, duration };
}

/**
 * 运行性能测试
 * @param {string} url - 包含组件列表的URL
 */
async function runPerformanceTest(url) {
  console.log('======= 性能测试开始 =======');
  console.log(`测试URL: ${url}`);

  try {
    // 测试获取组件列表的时间
    console.log('\n1. 测试获取组件列表的性能');
    const { result: components, duration: navDuration } = await measureExecutionTime(extractNavigation, [url]);
    
    console.log(`组件列表获取完成，耗时: ${navDuration}ms`);
    console.log(`获取到 ${components.length} 个组件`);
    
    if (components.length > 0) {
      console.log('前5个组件:');
      components.slice(0, 5).forEach(comp => {
        console.log(`- ${comp.name}: ${comp.url}`);
      });
    }

    // 如果有组件，测试获取单个组件文档的时间
    if (components.length > 0) {
      console.log('\n2. 测试获取单个组件文档的性能');
      
      // 选择第一个组件进行测试
      const targetComponent = components[0].name;
      console.log(`选择组件: ${targetComponent}`);
      
      const { result: docResult, duration: docDuration } = await measureExecutionTime(
        getComponentDocumentation, 
        [url, targetComponent]
      );
      
      console.log(`组件文档获取完成，耗时: ${docDuration}ms`);
      console.log(`组件: ${docResult.name}`);
      console.log(`URL: ${docResult.url}`);
      console.log(`内容大小: ${docResult.content.length} 字符`);
      
      // 计算平均时间和总体评估
      console.log('\n3. 总体性能评估');
      console.log(`获取组件列表时间: ${navDuration}ms`);
      console.log(`获取单个组件文档时间: ${docDuration}ms`);
      console.log(`理论获取所有组件文档总时间: ~${navDuration + docDuration * components.length}ms`);
      
      // 性能建议
      if (navDuration > 2000 || docDuration > 1000) {
        console.log('\n建议: 考虑将组件列表缓存或写死，特别是对于性能敏感的应用。');
      } else {
        console.log('\n建议: 性能看起来不错，可以考虑实时获取组件列表，以保持数据最新。');
      }
    }
  } catch (error) {
    console.error('测试过程中出错:', error.message);
    console.error(error.stack); // 打印完整的错误堆栈
  }
  
  console.log('\n======= 性能测试结束 =======');
}

// 直接执行测试，不再判断是否通过命令行运行
const testUrl = process.argv[2] || 'https://vue2.tuniaokj.com/components/setting.html';
console.log('开始执行性能测试...');
runPerformanceTest(testUrl).catch(error => {
  console.error('执行测试时出错:', error);
  console.error(error.stack);
});

export { runPerformanceTest }; 