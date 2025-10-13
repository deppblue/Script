/*
Surge 脚本 - 修改 Stripe Express Checkout Element Session 请求
拦截路径: https://api.stripe.com/v1/elements/express_checkout_element/session
功能: 将 mode 从 setup 改为 payment
*/

const url = $request.url
const method = $request.method

// 只处理 Stripe Express Checkout Element Session API 的请求
if (url.includes('api.stripe.com/v1/elements/express_checkout_element/session') && method === 'POST') {
  // 获取原始请求体
  let body = $request.body

  try {
    // 解析表单数据
    const params = new URLSearchParams(body)

    // 检查并修改 mode 参数
    if (params.has('mode') && params.get('mode') === 'setup') {
      params.set('mode', 'payment')
      console.log('Stripe Express 脚本: 已将 mode 从 setup 修改为 payment')
    }

    // 更新请求体
    $done({ body: params.toString() })
  } catch (error) {
    // 解析失败，返回原始请求
    console.log('Stripe Express 脚本解析错误:', error)
    $done({})
  }
} else {
  // 不是目标请求，直接放行
  $done({})
}
