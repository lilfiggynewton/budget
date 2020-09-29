
//Budget Controller //keeps track of incomes and expenses of budget and percentages

var budgetController = (function(){
var Expense = function(id, description, value){
  this.id = id;
  this.description = description;
  this.value = value;
  this.percentage = -1;
};
Expense.prototype.calcPercentage = function(totalIncome){
  if(totalIncome > 0){
    this.percentage = Math.round((this.value / totalIncome) * 100);
  }else{
    this.percentage = -1;
  }
};
Expense.prototype.getPercentage = function(){
  return this.percentage;
}
var Income = function(id, description, value){
  this.id = id;
  this.description = description;
  this.value = value;
};

var calculateTotal = function(type){
  var sum = 0;
  data.allItems[type].forEach(function(cur){
    sum += cur.value;
  });
  data.totals[type] = sum;
}

var data = {
  allItems: {
    exp: [],
    inc: []
  },
  totals: {
    exp: 0,
    inc: 0
  },
  budget: 0,
  percentage: -1
}

return {
  addItem: function(type, des, val){
    var newItem, id;
    if(data.allItems[type].length > 0){
    id = data.allItems[type][data.allItems[type].length -1].id + 1;
  }else {
    id = 0;
  }
    if (type === 'exp') {
      newItem = new Expense(id, des, val);
    } else if (type  === 'inc') {
      newItem = new Income(id, des, val);
    }
    data.allItems[type].push(newItem);
    return newItem;
  },

  deleteItem: function(type, id){
    // id = 6
    // data.allItmes[type][id]
    // ids = [1 2 4 6 8]
    //index = 3

    var ids = data.allItems[type].map(function(current){ //callback function
      //map returns a brand new array
      return current.id;

    });
    index = ids.indexOf(id);

    if(index !== -1){
        data.allItems[type].splice(index, 1)
    }
  },

  calculateBudget: function(){
    //calculate total income and expesnes
      calculateTotal('exp');
      calculateTotal('inc');
    //calculate the budget: income minus expenses
      data.budget = data.totals.inc - data.totals.exp;
    //calculate the percentage of income that the we spent
    if(data.totals.inc > 0){

      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    } else {
      data.percentage = -1;
    }
  },

  calculatePercentages: function(){
    // a = 20 b 10 c= 40 total income = 100
    //a = 20/100 = 20%
    //b = 10/100 = 10%
    //c = 40/100 = 40%
    data.allItems.exp.forEach(function(cur){
      cur.calcPercentage(data.totals.inc);
    });
  },

  getPercentages: function(){
    var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
    });
    return allPerc; //is an array with all perctanges map returns something for each does not

  },
  getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
  },

  testing: function(){
    console.log(data);
  }
};

})();

//UI Controller
var uiController = (function(){
    var domStrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer:'.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;
        // + 0r - before number

        // exactly 2 decimal points

        // comma separating the thousands
        // 2310.4567 -> 2,310.46 example
        num = Math.abs(num); //removes sign of number
        num = num.toFixed(2); //not math object method method of the number prototype
        //num was primative but is automatically converted to an object

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
          //allow to take only a part of a string
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback){
      for( var i = 0; i < list.length; i++){
        callback(list[i], i);
      }
    };

    return {
      getInput: function(){
        return {
         type: document.querySelector(domStrings.inputType).value, //Will be either inc or exp
         description: document.querySelector(domStrings.inputDescription).value,
         value: parseFloat(document.querySelector(domStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
        //create html string with placeholder text
        if(type === 'inc'){
          element = domStrings.incomeContainer;
          html = '<div class="item clearfix"id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if(type === 'exp'){
          element = domStrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      }
        //Replase the placeholder text with some actual data that we recieve from object
          newHtml = html.replace('%id%', obj.id);
          newHtml = newHtml.replace('%description%', obj.description);
          newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        //Insert the HTML into the dom
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function (selectorID) {
      //can only remove child of an an element
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function(){
      var fields;
      fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
      //will return a list not array
      //convert list to array
      //fields.slice will not work must tap into prototype methods for arrays
      //function consturctor Array

      var fieldsArr = Array.prototype.slice.call(fields); //this variable set to fields
      //now an array and not a list

      fieldsArr.forEach(function(currentValue, indexNumber, array){
        //can recieve up to three arguments
        //can name as you want
        currentValue.value = "";
      });

        fieldsArr[0].focus();
    },

    displayBudget:function(obj){
        var type;
        obj.budget > 0 ? type = 'inc' : 'exp';

        document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
        document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage;
        if(obj.percentage > 0 ){
          document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
          document.querySelector(domStrings.percentageLabel).textContent = '---';

        }
    },

    displayPercentages: function(percentages){
      var  fields = document.querySelectorAll(domStrings.expensesPercLabel);

      //each element is called a node, cannot use forEach for nodeList but can create your own.

      nodeListForEach(fields, function(current, index){
          if(percentages[index] > 0){

          current.textContent = percentages[index] + '%';
        }else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function(){
      var now, year, month, months;
      now = new Date();
      months = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      // var christmas = new Date(2016, 11, 25);
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;


    },
    changedType: function(){
      var fields = document.querySelectorAll(
        domStrings.inputType + ',' +
        domStrings.inputDescription + ',' +
        domStrings.inputValue); //this returns a node list

        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });
        document.querySelector(domStrings.inputBtn).classList.toggle('red');
    },
    getDOMStrings: function(){
      return domStrings;
    }
  };
})();

//Global App Controller
var controller = (function(budgetCtrl, uiCtrl){
  var input, newItem;
  var setupEventListeners = function(){
    var dom = uiCtrl.getDOMStrings();
    document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress',function(event) {
      if(event.keyCode === 13 || event.which === 13){
          ctrlAddItem();
      }
    });
      document.querySelector(dom.container).addEventListener('click',ctrlDeleteItem);
      document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType());

  };
  var updateBudget = function(){
    //1. Calculate the budget
      budgetCtrl.calculateBudget();
    //2. Return the budget
      var budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
    //2. Read percentages from the budget Controller
        var percentages = budgetCtrl.getPercentages();
    //3. Updadate the UI with the new percentages
        uiCtrl.displayPercentages(percentages);
  }
  var ctrlAddItem = function(){
    //1. Get the filed input data
      var input = uiCtrl.getInput();

      if(input.description !== "" && !isNaN(input.value) && input.value > 0){
    //2. Add the item to the budget Controller
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //3. Add the item to the UI
      uiController.addListItem(newItem, input.type);

    //4. Clear the fields
        uiCtrl.clearFields();
    //5. Calculate and update budget
    updateBudget();

    //6. Calculate and update update percentages
    updatePercentages();
  }
  };

  var ctrlDeleteItem = function(event){
    var itemID, spiltID, type, id;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      if(itemID){
          //inc-1
          splitID = itemID.split('-');
          type = splitID[0];
          id = parseInt(splitID[1]);
          //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, id);
          //2. Delete the item from the ui
            uiCtrl.deleteListItem(itemID);
          //3. Update and show the new budget
          updateBudget();

          //4. calculate and update percentages
          updatePercentages();
      }
  };

  return {
    init: function(){
      console.log('Application has started');
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, uiController);

controller.init();
