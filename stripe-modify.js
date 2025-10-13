/*
Surge 脚本 - 修改 Stripe Elements Sessions API 响应
拦截路径: https://api.stripe.com/v1/elements/sessions
功能: 添加 Amazon Pay 支付方式
*/

const url = $request.url
const method = $request.method

// 只处理 Stripe Elements Sessions API 的响应
if (url.includes('api.stripe.com/v1/elements/sessions') && method === 'GET') {
  // 获取原始响应
  let body = $response.body

  try {
    // 解析 JSON 响应
    let responseData = JSON.parse(body)

    // 1. 在 ordered_payment_method_types_and_wallets 中添加 amazon_pay
    if (responseData.ordered_payment_method_types_and_wallets) {
      if (!responseData.ordered_payment_method_types_and_wallets.includes('amazon_pay')) {
        // 在第二个位置插入 amazon_pay (card 之后)
        responseData.ordered_payment_method_types_and_wallets.splice(1, 0, 'amazon_pay')
      }
    }

    // 2. 在 payment_method_specs 中添加 amazon_pay 配置
    if (responseData.payment_method_specs) {
      // 检查是否已存在 amazon_pay
      const hasAmazonPay = responseData.payment_method_specs.some((spec) => spec.type === 'amazon_pay')

      if (!hasAmazonPay) {
        // 添加 Amazon Pay 配置
        const amazonPaySpec = {
          async: false,
          fields: [],
          localization: {
            content: {},
          },
          selector_icon: {
            light_theme_png: 'https://js.stripe.com/v3/fingerprinted/img/payment-methods/icon-pm-amazonpay_light@3x-46eb8b8a4a252b78d7b4c3b96d4ed7ae.png',
            light_theme_svg: 'https://js.stripe.com/v3/fingerprinted/img/payment-methods/icon-pm-amazonpay_light-22cdec0f5f5609554a34fa62fa583f23.svg',
          },
          type: 'amazon_pay',
        }

        // 在 card 之后插入
        responseData.payment_method_specs.splice(1, 0, amazonPaySpec)
      }
    }

    // 3. 在 payment_method_preference.ordered_payment_method_types 中添加 amazon_pay
    if (responseData.payment_method_preference && responseData.payment_method_preference.ordered_payment_method_types) {
      if (!responseData.payment_method_preference.ordered_payment_method_types.includes('amazon_pay')) {
        // 在 card 之后添加 amazon_pay
        responseData.payment_method_preference.ordered_payment_method_types.push('amazon_pay')
      }
    }

    // 更新响应体
    $done({ body: JSON.stringify(responseData) })
  } catch (error) {
    // JSON 解析失败，返回原始响应
    console.log('Stripe 脚本解析错误:', error)
    $done({})
  }
} else {
  // 不是目标请求，直接放行
  $done({})
}
