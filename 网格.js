

var pos0
var pos1
//var list_set = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0], [], 0, 0]
var rows = []
var table1
var total0
var total1
var setmoney
var threshold


var list = {
    //    "UNFI_USDT": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0], [], 0, 0, []],
    "ETC_USDT": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0], [], 0, 0, []],
    //    "DOGE_USD": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0], [], 0, 0, []]
}
//0,合约倍 1，初始份数 2，每份价值 3，盈利点 4，加仓点 5，1多2空3双 6，币精 7，价精度 8，资料继承01 9，清仓点 10、多平衡设置 11、空平衡设置 12、平衡总价值 13、平衡点
//list.DOGE_USD[11] = [10, 20, 30, 0.005, 0.005, 1, 0, 5, 1, 1,2, 2,10000,0.005]
//list.UNFI_USDT[11] = [10, 20, 20, 0.005, 0.005, 1, 1, 3, 1, 1,2, 2,10000,0.005]
list.ETC_USDT[11] = [10, 20, 200, 0.005, 0.005, 1, 3, 3, 1, 1, 1, 1, 10000, 0.005]




if (load && _G("list")) {

    list = _G("list")
}



function onTick_U(x) {

    let list_doge = list[x]



    MarginLevel = list_doge[11][0]
    money_statr = list_doge[11][1]
    money1 = list_doge[11][2]
    loss = list_doge[11][3]
    profit = list_doge[11][4]
    //   ok=list_doge[11][5]
    amountScale = list_doge[11][6]
    priceScale = list_doge[11][7]
    load = list_doge[11][8]
    abc = list_doge[11][9]
    let LW = list_doge[11][10]
    let SW = list_doge[11][11]
    setmoney = list_doge[11][12]
    threshold = list_doge[11][13]

    exchange.SetContractType("swap")
    exchange.SetMarginLevel(MarginLevel)
    if (!IsVirtual()) {
        exchange.SetCurrency(x)
        exchange.SetPrecision(list_doge[11][6], list_doge[11][7])
        ok = list_doge[11][5]
    }


    let ticker = _C(exchange.GetTicker)
    let account = _C(exchange.GetAccount)
    let position = _C(exchange.GetPosition)
    let pos0 = position[0] && position[0].Type == 0 ? position[0] : null
    let pos1 = position[1] ? position[1] : position[0] && position[0].Type == 1 ? position[0] : null





    let long = 0    //多仓订单数量
    let short = 0   //空仓订单数量
    if (1) {    //表示一个功能块    读取订单区分订单个数用于开仓依据
        let orders = _C(exchange.GetOrders)
        if (orders && orders.length != 0) {
            for (var i = 0; i < orders.length; i++) {
                //00 开多11平多         10 开空01 平空      "Type":0,"Offset":0
                let aax = orders[i]
                let aa
                if ((aax.Type == 0 && aax.Offset == 0) || (aax.Type == 1 && aax.Offset == 1)) {
                    long = long + 1
                }
                if ((aax.Type == 1 && aax.Offset == 0) || (aax.Type == 0 && aax.Offset == 1)) {
                    short = short + 1
                }
            }
        }

    }
    let money = money1 / 1       //使用单次金额除以10 表示张数

    if (ok == 1 || ok == 3) {

        if (!pos0) { // && _Cross(kdj[0],kdj[1])>0
            if (list_doge[3]) {
                let order = exchange.GetOrder(list_doge[3])
                let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                if (order.Status == 1) {
                    list_doge[3] = 0
                    list_doge[4] = 0
                    aa = order.DealAmount * order.AvgPrice - list_doge[10][5] * order.DealAmount
                    list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                    list_doge[10][1] = list_doge[10][1] + aa
                    list_doge[10][3] = list_doge[10][3] + aa

                    Log(list_doge[10][1], "本轮收益", list_doge[10][3], "#FF0033")
                }
            }
            exchange.SetDirection("buy")
            let id = exchange.Buy(-1, money * money_statr / ticker.Last, "开多", ticker.Last)     //直接相乘得到初始张数
            list_doge[4] = 0
            list_doge[12] = ticker.Last

            if (id) {
                let order = exchange.GetOrder(id)
                if (order) {
                    list_doge[0] = order.AvgPrice
                    list_doge[1] = order.DealAmount  //0 //order.DealAmount
                    list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                    list_doge[10][3] = 0
                } else {
                    let position = _C(exchange.GetPosition)
                    let pos0 = position[0] && position[0].Type == 0 ? position[0] : null
                    let pos1 = position[1] ? position[1] : position[0] && position[0].Type == 1 ? position[0] : null
                    list_doge[0] = pos0.Price
                    list_doge[1] = order.DealAmount  //0 //order.DealAmount
                    list_doge[10][0] = list_doge[10][0] + pos0.Amount * pos0.Price
                    list_doge[10][3] = 0

                }
            } else {
                return false
            }

        }

        if (LW == 1 && pos0) {

            if (list_doge[0] == 0) {
                list_doge[0] = ticker.Last
            }
            let profit1 = profit
            let buyprice = list_doge[12] //Math.pow((1 - loss), list_doge[4]) * list_doge[0]

            if (long < 2) { // || ticker.Last > buyprice * (1 + profit * 1)         list_doge[1] != pos0.Amount || 
                cancelAll(0)
                let pos = _C(exchange.GetPosition)
                let pos0 = pos[0] && pos[0].Type == 0 ? pos[0] : null

                if (pos0.Amount > list_doge[1]) {
                    list_doge[4] = list_doge[4] + 1
                    let order = exchange.GetOrder(list_doge[2])
                    let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                    if (order && order.Status == 1) {
                        list_doge[2] = 0
                        list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                    }
                }

                if (pos0.Amount < list_doge[1]) {
                    list_doge[4] = list_doge[4] - 1
                    let order = exchange.GetOrder(list_doge[3])
                    let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                    if (order && order.Status == 1) {
                        list_doge[3] = 0
                        aa = order.DealAmount * order.AvgPrice - pos0.Price * order.DealAmount
                        list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                        list_doge[10][1] = list_doge[10][1] + aa
                        list_doge[10][3] = list_doge[10][3] + aa
                    }
                    //  Log(list)

                }
                buyprice = list_doge[12] = Math.pow((1 - loss), list_doge[4]) * list_doge[0]
                exchange.SetDirection("buy")
                if (pos0.Amount * ticker.Last < money * money_statr / 2) {
                    exchange.Buy(-1, money * money_statr / 2 / ticker.Last, "开多", ticker.Last)      //张数乘份数除2表示补一半
                    return false
                }
                //直接下单张 数
                list_doge[2] = exchange.Buy(buyprice * (1 - loss * 1), money / ticker.Last, "最新成交价", ticker.Last, "指导价", _N(buyprice, 5), " |数量", pos0.Amount, " |浮盈", pos0.Profit, " |Margin", pos0.Margin, " 余额", account.Balance, "#44BB74")

                exchange.SetDirection("closebuy")
                list_doge[3] = exchange.Sell(buyprice * (1 + profit1 * 1), money / ticker.Last, "次数", list_doge[4], " |数量", pos0.Amount, " |本轮收益", list_doge[10][3] + pos0.Profit, " |均价", pos0.Price, " |Margin", pos0.Margin, "#ACDCBF")
                list_doge[10][5] = pos0.Price
                list_doge[1] = pos0 ? pos0.Amount : 0

            }
            if (1) {

                //LW = list_doge[11][10]
                if (pos0.Amount * ticker.Last > setmoney * 0.98) {

                    cancelAll(0)
                    list_doge[11][10] = 2
                }
            }
        }
        if (LW == 2 && pos0) {

            setmoney = list_doge[11][12]
            threshold = list_doge[11][13]

            let nowmoney = pos0.Amount * pos0.Price + pos0.Profit //当前价值
            let diffAsset = setmoney - nowmoney //计算差额
            let ratio = diffAsset / setmoney; // 计算差额比例
            let flag = 0
            if (Math.abs(ratio) > threshold) { // 如果 ratio的绝对值小于指定阈值
                flag = 1
                //  return false; // 返回 false
            }
            let boom = 0
            if (!IsVirtual()) {
                boom = pos0.Info.liquidationPrice > 0 ? pos0.Info.liquidationPrice : 0

            }



            if (flag && nowmoney * (1 + threshold) < setmoney) { // 判定当前价值
                let buyPrice = ticker.Sell // _N(ticker.Sell + spread, priceScale); // 计算下单价格
                let buyAmount = _N(diffAsset / buyPrice, amountScale); // 计算下单量
                if (buyAmount > 5 / buyPrice) { // 如果下单量小于最小交易量 最小交易额 buyPrice*MinStock<5

                    exchange.SetDirection("buy")
                    let id = exchange.Buy(-1, buyAmount, "币种", ticker.Buy, "|爆仓价", boom, "| 持仓数量:", pos0.Amount, "| 持仓价值", _N(nowmoney, 2), "| 浮动亏盈:", _N(pos0.Profit, 2), "| Margin:", _N(pos0.Margin, 2), "| 现有资金:", _N(account.Balance, 2), "| 持仓均价:", _N(pos0.Price, priceScale), "#cc3299"); // 买入下单

                    if (id) {

                        let order = exchange.GetOrder(id)
                        if (order && order.Status == 1) {
                            list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                        }
                    }
                }
                //      cancelAll()
            }
            if (flag && nowmoney > setmoney * (1 + threshold)) {
                let sellPrice = ticker.Buy // _N(ticker.Buy - spread, priceScale); // 计算下单价格
                let sellAmount = _N(-diffAsset / sellPrice, amountScale); // 计算下单量
                if (sellAmount > 5 / sellPrice) { // 如果下单量小于最小交易量 最小交易额 buyPrice*MinStock<5        

                    //   cancelAll()               //records[records.length-1].Close
                    exchange.SetDirection("closebuy")
                    let id = exchange.Sell(-1, sellAmount, "币种", ticker.Buy, "|爆仓价", boom, "| 持仓数量:", pos0.Amount, "| 持仓价值", _N(nowmoney, 2), "| 浮动亏盈:", _N(pos0.Profit, 2), "| Margin:", _N(pos0.Margin, 2), "| 现有资金:", _N(account.Balance, 2), "| 持仓均价:", _N(pos0.Price, priceScale), "#99cc32"); // 卖出下单


                    if (id) {

                        let order = exchange.GetOrder(id)
                        let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                        if (order && order.Status == 1) {
                            list_doge[3] = 0
                            aa = order.DealAmount * order.AvgPrice - pos0.Price * order.DealAmount
                            list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                            list_doge[10][1] = list_doge[10][1] + aa
                            list_doge[10][3] = list_doge[10][3] + aa
                        }
                        //  Log(list)

                    }
                }

            }



        }
    }

    // if (pos0 && (pos0.Profit < 0 && ok == 3)) {      // || ok == 2 || ok == 3
    if (ok == 2 || ok == 3) {
        //let rs=exchange.GetRecords(PERIOD_D1)

        if (0 && pos0 && pos0.Profit > 0) {
            return false
        }


        if (!pos1) { //_Cross(macd[0],macd[1])<0

            if (list_doge[8]) {
                let order = exchange.GetOrder(list_doge[8])
                let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                if (order.Status == 1) {
                    list_doge[9] = 0
                    aa = list_doge[10][6] * order.DealAmount - order.DealAmount * order.AvgPrice
                    list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                    list_doge[10][2] = list_doge[10][2] + aa
                    list_doge[10][4] = list_doge[10][4] + aa
                    list_doge[8] = 0
                    Log(list_doge[10][2], "本轮收益", list_doge[10][4], "#99FF00")
                }
            }
            let money_statr3 = pos0 ? pos0.Amount * ticker.Last / money : money_statr
            let money_statr2 = money_statr
            if (money_statr3 / 3 > money_statr) {
                money_statr2 = money_statr3 / 3
            }
            exchange.SetDirection("sell")
            let id = exchange.Sell(-1, money * money_statr2 / ticker.Buy, "开多", ticker.Last)
            list_doge[9] = 0
            if (id) {
                let order = exchange.GetOrder(id)

                if (order) {
                    list_doge[5] = order.AvgPrice
                    list_doge[6] = 0 //order.DealAmount
                    list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                    list_doge[10][4] = 0
                } else {
                    let position = _C(exchange.GetPosition)
                    let pos0 = position[0] && position[0].Type == 0 ? position[0] : null
                    let pos1 = position[1] ? position[1] : position[0] && position[0].Type == 1 ? position[0] : null

                    list_doge[5] = pos1.Price
                    list_doge[6] = 0 //order.DealAmount
                    list_doge[10][0] = list_doge[10][0] + pos1.Amount * pos1.Price
                    list_doge[10][4] = 0

                }

            } else {
                return false
            }

        }
        if (SW == 1 && pos1) {

            let buyprice = list_doge[13] // Math.pow((1 + profit), list_doge[9]) * list_doge[5]

            if (short < 2) {
                cancelAll(1)
                position = _C(exchange.GetPosition)
                pos0 = position[0] && position[0].Type == 0 ? position[0] : null
                pos1 = position[1] ? position[1] : position[0] && position[0].Type == 1 ? position[0] : null

                if (pos1.Amount > list_doge[6]) {
                    list_doge[9] = list_doge[9] + 1
                    let order = exchange.GetOrder(list_doge[7])
                    let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                    if (order && order.Status == 1) {
                        list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                        list_doge[7] = 0
                        //    Log(list_doge[10][2], "买", order, list_doge[9], "#D52B2B")
                    }
                }
                if (pos1.Amount < list_doge[6]) {
                    list_doge[9] = list_doge[9] - 1
                    let order = exchange.GetOrder(list_doge[8])
                    let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                    if (order && order.Status == 1) {
                        aa = pos1.Price * order.DealAmount - order.DealAmount * order.AvgPrice
                        list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                        list_doge[10][2] = list_doge[10][2] + aa
                        list_doge[10][4] = list_doge[10][4] + aa
                        list_doge[8] = 0
                        //    Log(list_doge[10][2], "卖", order, "#D52B2B")
                    }
                }
                buyprice = list_doge[13] = Math.pow((1 + profit), list_doge[9]) * list_doge[5]
                exchange.SetDirection("sell")

                let money_statr3 = pos0 ? pos0.Amount * ticker.Last / money : money_statr
                let money_statr2 = money_statr
                if (money_statr3 / 3 > money_statr) {
                    money_statr2 = money_statr3 / 3
                }
                if (pos1.Amount * ticker.Last < money * money_statr2 / 2) {
                    exchange.Sell(-1, money * money_statr2 / 2 / ticker.Last, "开多", ticker.Last)
                    return false
                }
                list_doge[7] = exchange.Sell(buyprice * (1 + profit * 1), money / ticker.Last, "最新成交价", ticker.Last, "布网", buyprice, list_doge[9], " |数量", pos1.Amount, " |浮盈", pos1.Profit, " |Margin", pos1.Margin, "#FF224E")
                exchange.SetDirection("closesell")
                list_doge[8] = exchange.Buy(buyprice * (1 - loss * 1), money / ticker.Last, "次数", list_doge[9], " |数量", pos1.Amount, " |本轮收益", list_doge[10][4] + pos1.Profit, " |均价", pos1.Price, " |Margin", pos1.Margin, "#D52B2B")

                list_doge[10][6] = pos1.Price

                list_doge[6] = pos1 ? pos1.Amount : 0

            }

        }

        if (SW == 2 && pos1) {


            let nowmoney = pos1.Amount * pos1.Price + pos1.Profit //当前价值

            let diffAsset = setmoney - nowmoney //计算差额
            let ratio = diffAsset / setmoney; // 计算差额比例
            let flag = 0
            if (Math.abs(ratio) > threshold) { // 如果 ratio的绝对值小于指定阈值

                flag = 1
                //   return false; // 返回 false
            }

            let boom = 0
            if (!IsVirtual()) {
                boom = pos1.Info.liquidationPrice > 0 ? pos1.Info.liquidationPrice : 0

            }

            let nb = ns = 1
            if (flag && nowmoney * (1 + threshold * nb * 1) < setmoney) { // 如果 ratio大于 0  && ema7[records.length-1]>ema25[records.length-1]     && _Cross(kdj[0],kdj[1])>0
                let buyPrice = ticker.Sell  // _N(ticker.Sell + spread, priceScale); // 计算下单价格
                let buyAmount = _N(diffAsset / buyPrice, amountScale); // 计算下单量
                if (buyAmount > 5 / buyPrice) { // 如果下单量小于最小交易量 最小交易额 buyPrice*MinStock<5
                    exchange.SetDirection("sell")
                    let id = exchange.Sell(-1, buyAmount, "币种", ticker.Buy, "|爆仓价", boom, "| 持仓数量:", pos1.Amount, "| 持仓价值", _N(nowmoney, 2), "| 浮动亏盈:", _N(pos1.Profit, 2), "| Margin:", _N(pos1.Margin, 2), "| 现有资金:", _N(account.Balance, 2), "| 持仓均价:", _N(pos1.Price, priceScale), "#cc3299"); // 买入下单
                    if (id) {

                        let order = exchange.GetOrder(id)
                        if (order && order.Status == 1) {
                            list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                        }

                    }

                }


            }
            if (flag && nowmoney > setmoney * (1 + threshold * ns * 1)) {
                let sellPrice = ticker.Buy //_N(ticker.Buy - spread, priceScale); // 计算下单价格
                let sellAmount = _N(-diffAsset / sellPrice, amountScale); // 计算下单量
                if (sellAmount > 5 / sellPrice) { // 如果下单量小于最小交易量 最小交易额 buyPrice*MinStock<5        


                    exchange.SetDirection("closesell")
                    let id = exchange.Buy(-1, sellAmount, ns, "币种", ticker.Buy, "|爆仓价", boom, "| 持仓数量:", pos1.Amount, "| 持仓价值", _N(nowmoney, 2), "| 浮动亏盈:", _N(pos1.Profit, 2), "| Margin:", _N(pos1.Margin, 2), "| 现有资金:", _N(account.Balance, 2), "| 持仓均价:", _N(pos1.Price, priceScale), "#cc3299"); // 卖出下单

                    if (id) {

                        let order = exchange.GetOrder(id)
                        let aa = 0 // _N(ticker.Buy * sellAmount - pos0.Price * sellAmount, 5)
                        if (order && order.Status == 1) {
                            list_doge[8] = 0
                            aa = pos1.Price * order.DealAmount - order.DealAmount * order.AvgPrice
                            list_doge[10][0] = list_doge[10][0] + order.DealAmount * order.AvgPrice
                            list_doge[10][2] = list_doge[10][2] + aa
                            list_doge[10][4] = list_doge[10][4] + aa


                        }

                    }


                }
            }


        }
    }

    if (pos1) {
        // SW = list_doge[11][11]
        setmoney = list_doge[11][12]
        threshold = list_doge[11][13]
        if (pos1.Amount * ticker.Last > setmoney * 0.98) {
            cancelAll(1)
            list_doge[11][11] = 2
        }

    }

    if (1 && pos1 && ticker.Last*1.15 > pos1.Prices) {

        let position = _C(exchange.GetPosition)
        let pos0 = position[0] && position[0].Type == 0 ? position[0] : null
        let pos1 = position[1] ? position[1] : position[0] && position[0].Type == 1 ? position[0] : null

        exchange.SetDirection("closesell")
        exchange.Buy(-1, pos1.Amount); // 卖出下单

        list_doge[11][11] = 1
        return false
    }


    if (1 && pos0 && ticker.Last > pos0.Price * 1.15) {

        let position = _C(exchange.GetPosition)
        let pos0 = position[0] && position[0].Type == 0 ? position[0] : null
        let pos1 = position[1] ? position[1] : position[0] && position[0].Type == 1 ? position[0] : null

        exchange.SetDirection("closebuy")
        exchange.Sell(-1, pos0.Amount); // 卖出下单

        list_doge[11][10] = 1
        return false
    }



    let change = {
        "type": "button",
        "cmd": "coverAll",
        "name": "平仓|cover",
        "description": "描述|description"
    }



    let text = {
        "type": "button",
        "cmd": "list_doge",
        "name": "多空设置",
        "description": "数字1为多2为空3为同时",
        "input": {
            "name": "开仓数量",
            "type": "string",
            "defValue": x + ',' + list_doge[11][5]
        }
    }

    let select = {
        "type": "button",
        "cmd": "set",
        "name": "设置",
        "description": "这是一个置按钮，可以用于执行开仓操作。",
        "select": {
            "text": "请选择开仓数量",
            "options": [
                { "text": "合约倍数", "value": list_doge[11][0] },
                { "text": "初始仓位份数", "value": list_doge[11][1] },
                { "text": "单次仓位面值", "value": list_doge[11][2] },
                { "text": "补仓点 ", "value": list_doge[11][3] },
                { "text": "2盈利点", "value": list_doge[11][4] },
                { "text": "多空开仓", "value": list_doge[11][5] },
                { "text": "量精度", "value": list_doge[11][6] },
                { "text": "价格精度", "value": list_doge[11][7] },
                { "text": "继承数据", "value": list_doge[11][8] },
                { "text": "止盈清仓", "value": list_doge[11][9] }
            ],
            "defValue": "1"
        }
    }

    let total0 = pos0 ? pos0.Profit : 0
    let total1 = pos1 ? pos1.Profit : 0
    rows.push(["币种", "价格精度", "数量精度", _N(list_doge[10][1], 4), _N(list_doge[10][2], 4), _N(list_doge[10][1] + list_doge[10][2] + total0 + total1, 4), _N(list_doge[10][0], 4), select, text, change])


}


function cancelAll(x) {
    while (1) {
        let orders = _C(exchange.GetOrders)
        if (orders && orders.length == 0) {
            break
        }

        for (let i = 0; i < orders.length; i++) {
            //00 开多11平多         10 开空01 平空      "Type":0,"Offset":0
            let aax = orders[i]
            let aa
            if (x == 0) {
                if ((aax.Type == 0 && aax.Offset == 0) || (aax.Type == 1 && aax.Offset == 1)) {
                    aa = aax.Type == 1 ? "没赚钱--" : "--赚钱"
                    exchange.CancelOrder(aax.Id, aa, aax, "#44BB74")
                }
            }
            if (x == 1) {
                if ((aax.Type == 1 && aax.Offset == 0) || (aax.Type == 0 && aax.Offset == 1)) {
                    aa = aax.Type == 0 ? "没赚钱--" : "--赚钱"
                    exchange.CancelOrder(aax.Id, aa, aax, "#D52B2B")
                }
            }
        }
        break

    }
}


function main() {




    let money_statr1 = money_statr
    while (1) {

        rows = []
        // onTick("ETC_USDT")
        // onTick_U("ETC_USDT")

        //上面两个运行正常
        //下面的因为循环导致不正常  分开独立正常    在测试中因为订单次数问题导致不停累加，回测中只有一个交易对。

        if (1) {
            for (var key in list) {

                // rows = []


                if (!IsVirtual() && key == "DOGE_USD") { //  DOGE_USD        ETC_USDT   指定狗币币本位       本地测试通过 IsVirtual()
                    onTick(key)
                    //continue
                } else {
                    onTick_U(key)
                }


            }
        }








        _G("list", list) //数据保存









        let cmd = GetCommand()
        if (cmd) {
            Log(cmd)
            let arr = cmd.split(":")
            if (arr[0] == "要做空") {
                ok = arr[1]
            } else if (arr[0] == "检查symbol_list") {
                Log("没数据就是没有符合条件的", symbol_list)
            } else if (arr[0] == "list_doge") {
                let new_array = arr[1].split(",").map(Number)
                Log(list)
                list[new_array[0]][11][5] = new_array[1]
                Log(new_array)
                Log(list)
            }


        }























        //   rows.push([' ', ' ', ' ', ' ', '收益汇总: ', _N(total[0], 4), _N(total[1], 4) + '/' + _N(total[1] * 0.0004, 4), ' ', ' '])

        //Log(rows)
        table1 = {
            type: 'table',
            title: '持仓信息',
            cols: ['币种', '价格精度', '数量精度', '多仓收益', '空仓收益', '收益汇总', '总交易额', '多仓设定金额', '空仓设定金额', '多空平'],
            rows: rows


        }

        LogStatus('`' + JSON.stringify(table1) + '`')

        Sleep(1000 * 2)
    }
}
