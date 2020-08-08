// Module to budget calculation


var budgetController = (function(){

   var Expense = function(id , description, value){
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };

   Expense.prototype.calcPercentage = function(totalIncome){
      if(totalIncome > 0)
          this.percentage = Math.round((this.value / totalIncome) * 100);
       else
          this.percentage = -1;
   };

   Expense.prototype.getPercentage = function(){
      return this.percentage;
   };

   var Income = function(id , description, value){
      this.id = id;
      this.description = description;
      this.value = value;
  };

  var calculateTotal = function(type){
       var sum=0
      data.allItems[type].forEach(function(cur){
       sum = sum + cur.value;
     });

     data.totals[type] = sum;
  };

   var data = {
      allItems : {
         exp : [],
         inc : []
      },

      totals : {
         exp : 0,
         inc : 0
      }, 

      budget : 0,
      percentage : -1
   };

   return {
      addItem : function(type , des , val){
          var newItem , ID;

         if(data.allItems[type].length > 0)
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
          else
            ID = 0;


         if (type === 'exp')
            newItem = new Expense(ID , des , val)   ;

         else if (type === 'inc')
            newItem = new Income(ID , des , val) ;

            data.allItems[type].push(newItem);
            return newItem;
      },

      calculateBudget : function(){
         //calculate total income and expense
         calculateTotal('inc');
         calculateTotal('exp')

         // calculate the budget : income - expense
         data.budget = (data.totals.inc - data.totals.exp);

         // calculate the percentage 
         if(data.totals.inc >0)
                data.percentage =   Math.round((data.totals.exp / data.totals.inc)*100);
         else
               data.percentage = -1;
      },

      calculatePercentage : function(){

         data.allItems.exp.forEach(function(cur){
            cur.calcPercentage(data.totals.inc);
         });
      },

      getPerc : function(){
         var perc;
          perc = data.allItems.exp.map(function(cur){
           return  cur.getPercentage();
         });
         return perc;
      },

      getBudget : function(){
         return {
            income : data.totals.inc ,
            expense : data.totals.exp ,
            budget : data.budget ,
            percentage : data.percentage
         }
      },

       //deleteItem
       deleteItem : function(type , id){
         var ids , index;

         ids = data.allItems[type].map(function(curr){
             return curr.id;
          });

          index = ids.indexOf(id);

          if ( index !== -1){
             data.allItems[type].splice(index , 1);
          }

       },


      testing : function(){
         console.log(data) ;
      }
   };

})();



// module to control UI

var UIcontroller = (function(){

   var DOMstrings = {
      inputType : '.add__type',
      inputDescription : '.add__description',
      inputValue : '.add__value',
      inputBTN : '.add__btn',
      inputIncome : '.income__list',
      inputExpense : '.expenses__list',
      budgetLabel : '.budget__value',
      incomeLabel : '.budget__income--value',
      expenseLabel : '.budget__expenses--value',
      percentageLabel : '.budget__expenses--percentage',
      container : '.container',
      expPercentage : '.item__percentage',
      month : '.budget__title--month'
   };

   var formatNumber = function(num , type){
       var  splitNum , int ,dec;

      num = Math.abs(num);
      num = num.toFixed(2);

      splitNum = num.split('.');
      int = splitNum[0];
      
      if(int.length > 3){
         int = int.substr(0 , int.length -3) + ',' + int.substr(int.length -3 , 3) ;
      }

      type === 'exp' ? sign = '-'  : sign = '+' ;
      dec = splitNum[1];

      return( sign +int + '.' + dec) ;
   };

   var nodeListForEach = function(list , callback){
      for(var i =0 ; i < list.length ; i++){
            callback(list[i],i);
      }
   };  

   return {

      // returns a object that contains DOM readings
      getInput : function(){                             // method that returns an object
         return {
            type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
         };
        
      },


      //clear the input 
      clearInput : function(){
          var field , fieldArr;

          field = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

          fieldArr = Array.prototype.slice.call(field);

          fieldArr.forEach(function(current , index , array){
             current.description = "";
             current.value = "";
          });

          fieldArr[0].focus();
         
      },


      //DOM strings returns
      getDOMstrings : function(){
         return DOMstrings;
      },

      // next returns
       addListItem : function(obj , type){
          var html , newHtml , element;
         
         if (type === 'inc'){
            element = DOMstrings.inputIncome;
            html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
         }else if(type === 'exp'){
            element = DOMstrings.inputExpense;
            html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
         }

         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', formatNumber(obj.value , type) );

         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

       },

       deleteListItem : function(selectorID){
            var el;
          el = document.getElementById(selectorID);
          el.parentElement.removeChild(el);
       },
     
       //display the top on UI
       displayBudget : function(obj){
         var type ;
          obj.budget >= 0 ? type = 'inc' : type = 'exp';

         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget , type );
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber( obj.income , 'inc')  ;
         document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber( obj.expense , 'exp') ;

         if(obj.percentage > 0)
              document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
         else
             document.querySelector(DOMstrings.percentageLabel).textContent = '--';
       },

       //display expense percentage
       displayPercentages : function(percentage){
            var fields;
         fields = document.querySelectorAll(DOMstrings.expPercentage); 

           nodeListForEach(fields , function(current , index){

            if(percentage[index] >0 )
                  current.textContent = percentage[index] + '%';
               else
               current.textContent ='--';
               });
         
       },

       displayMonth : function(){
          var now , year , month , months , day;

          now = new Date();
          year = now.getFullYear();
          month = now.getMonth();
          day = now.getDate();

          months = ['January' , 'Fabuary' , 'March', 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December'];
          
          document.querySelector(DOMstrings.month).textContent = day + ' ' + months[month] + ' ' + year ;
       },


       changeColor : function(){
           var fields;

           fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputValue + ',' + DOMstrings.inputDescription);

           nodeListForEach(fields , function(cur , i){
               cur.classList.toggle('red-focus');
           });

           document.querySelector(DOMstrings.inputBTN).classList.toggle('red');


       }


   };
})();


// Module to control all flow 

var controller = (function( budgetCtrl , UI){

   
   var setupEvnetListener = function(){

      var DOM = UI.getDOMstrings();

      document.querySelector(DOM.inputBTN).addEventListener('click' , ctrlAddItem);
    
      document.addEventListener('keypress', function(event){
       if(event.keyCode === 13 || event.which === 13)
          ctrlAddItem();
      });  
      
      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change' , UI.changeColor);
   }

   // update budget fuction
   function updateBudget(){
      // 1. Calculate the Budget in Budget controller
        budgetCtrl.calculateBudget();

      // 2. Return the budget
       var budget = budgetCtrl.getBudget();

      // 3. Display the Budget 
      UI.displayBudget(budget);
   }

   var updatePercentage = function(){
      var percent;

      //1 . calculate the percentage
        budgetCtrl.calculatePercentage();

      //2. return the percente to controller
       percent = budgetCtrl.getPerc();
         
      // 3. display on the UI 
        UI.displayPercentages(percent);
   }

   // function to add Item 
    function ctrlAddItem(){
      var input , newItem;  

      // 1. get the field input data
         input = UI.getInput();


         if(input.description !== "" && !isNaN(input.value) && input.value >0){

           // 2.add item to budget controller
          newItem = budgetCtrl.addItem(input.type , input.description , input.value);
         
          // 3.Display the recent add
              UI.addListItem(newItem , input.type);
    
          // 4.clear the input fields
             UI.clearInput();
    
          // 5. Update the budget 
             updateBudget();

          // 6. update percentage
             updatePercentage();
         }      
    }

    var ctrlDeleteItem = function(event){
        var itemID , splitID , type ,ID; 

          itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id;

          if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseFloat(splitID[1]);
  
            // 1.delete the item from data structure
                 budgetCtrl.deleteItem(type , ID);
  
            // 2. delete from UI
                UI.deleteListItem(itemID);
  
            // 3. update the budget
                updateBudget();

             // 4. update percentage
                updatePercentage();
          }     
    }
  

   //  console.log(budgetCtrl.addItem('exp', 'yoyo', 14));

   return {
      
      init : function(){
         console.log('Application is started');   
         UI.displayMonth();
         UI.displayBudget( {
            income : 0 ,
            expense : 0 ,
            budget : 0 ,
            percentage : -1
         });
         return setupEvnetListener();
      }
   };
     
})(budgetController, UIcontroller);

controller.init();





