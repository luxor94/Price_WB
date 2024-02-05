let priceWB
let minPriciGoogleSheet

let lowPrice = [];
let okPrice = [];
let noPrice = [];
let minPriceObj = [];

const execute = () => {
  calcPriceWB();
  pushLowPrice();
  printLowPrice();
  for (let i = 0; i < okPrice.length; i++) {
    delete okPrice[i]['Продаем в минус']
    delete okPrice[i]['Цена со скидкой']
  }
  savePrice();
}
//импорт файла из xlsx в JSON
var ExcelToJSON = function() {

  this.parseExcel = function(file) {
    var reader = new FileReader();

    reader.onload = function(e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: 'binary'
      });
      workbook.SheetNames.forEach(function(sheetName) {
        // Here is your object
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        var json_object = JSON.stringify(XL_row_object);
        priceWB = (JSON.parse(json_object));
        jQuery( '#xlx_json' ).val( json_object );
      })
    };

    reader.onerror = function(ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
  pushObj();
  
};

//загрзка данных с гуглдокумента
const getMinPriceGoogleSheet = async () => {
  const promise = new Promise (async (resolve, reject) => {
      const res = await fetch (`https://sheets.googleapis.com/v4/spreadsheets/1NIftijVF3raCd9V4kGR84IPF8mX7rxZu1XhRKzzHHvg/values/Sheet1!A2:B13?key=AIzaSyAiBRULO7ybhamG5sW37qwUHy1vWu3ZAE0`);
      const data = res.json();
      resolve(data);
  })
  promise.then(data=> {
    minPriciGoogleSheet = (data)
  }).catch(() => { 
});
}

getMinPriceGoogleSheet();

//преобразование гугдокумента в нужный объект
const pushObj = () => {
for (let i = 0;i < minPriciGoogleSheet.values.length; i++) {
  minPriceObj.push({...minPriciGoogleSheet.values[i]})
  minPriceObj[i].Article = minPriceObj[i]['0']
  minPriceObj[i].Price = minPriceObj[i]['1']
  delete minPriceObj[i]['0']
  delete minPriceObj[i]['1']
}
}
//расчет цены после скидки(пока считает текущую, переделать на цену после скидки)
const calcPriceWB = () => {
  for (let i = 0; i < priceWB.length; i++) {
   let  price = 0;
   let discount = 0;
    if (priceWB[i]['Новая цена'] > 0) {
      price = priceWB[i]['Новая цена'];
    } else {
      price = priceWB[i]['Текущая цена']
    }

    if (priceWB[i]['Новая скидка'] > 0) {
      discount = priceWB[i]['Новая скидка'];
    } else {
      discount = priceWB[i]['Текущая скидка'];
    }
    priceWB[i]['Цена со скидкой'] = (price * (1-discount/100)*0.75-75);
  }
  findArt()
}
//считаем продаем ли в минус
const findArt = () => {
  for (let i=0; i<Object.values(priceWB).length;i++) {
      for (let j = 0; j < minPriciGoogleSheet.values.length; j++) {
        if(Object.values(priceWB[i])['2'] == minPriciGoogleSheet.values[j][0]) {
          //формула расчета
          priceWB[i]['Продаем в минус'] = (priceWB[i]['Цена со скидкой'] - minPriciGoogleSheet.values[j][1])
          
        } 
          
        
        
        //если не указана цена пишет НЕТ ЦЕНЫ ВХОДА
          
          
      }
      //priceWB[i]['Продаем в минус'] = 'НЕТ ЦЕНЫ ВХОДА';
  }

}

//пушим объекты в 3 разных массива, в зависимости от рассчета
const pushLowPrice = () => {
  for (let i = 0; i < priceWB.length; i++) {
    if (priceWB[i]['Продаем в минус'] <= 1) {
      lowPrice.push(priceWB[i])
    } 
    if (priceWB[i]['Продаем в минус'] > 1) {
      okPrice.push(priceWB[i])
    } else {
      noPrice.push(priceWB[i])
    }
  }

}


//выводим артикул ВБ где цена ниже входа
const printLowPrice = () => {
  let texareaLowPrice = [];
  let texareaNoPrice = [];
  for (let i = 0; i < lowPrice.length; i++) {
    texareaLowPrice.push(lowPrice[i]['Артикул WB']);
    document.querySelector("#lowPrice").value = texareaLowPrice.join('\n')
  } 
  
  for (let j = 0; j < noPrice.length; j++) {
    texareaNoPrice.push(noPrice[j]['Артикул WB']);
    document.querySelector("#noPrice").value = texareaNoPrice.join('\n')
    
  }
}
const postHisor = async () => {
  const promise = new Promise (async (resolve, reject) => {
      const res = await fetch (`https://sheets.googleapis.com/v4/spreadsheets/1NIftijVF3raCd9V4kGR84IPF8mX7rxZu1XhRKzzHHvg/values/Sheet2!A2:B13:append`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `AIzaSyAiBRULO7ybhamG5sW37qwUHy1vWu3ZAE0`,
        },
        body: JSON.stringify('test123')
      }
      
      );
      const data = res.json();
      resolve(data);
  })
  promise.then(data=> {
    
  }).catch(() => { 
});
}
  


  //экспорт в json
  function savePrice() {
    var stockList = XLSX.utils.json_to_sheet(okPrice);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, stockList, 'Отчет - цены и скидки на товары');
    XLSX.writeFile(wb, `Загрузить_цены_${(new Date().toJSON().slice(0,19))}.xlsx`);
    }
  