BZS = {};
BZS.app = {};
BZS.app.tools = {};

BZS.removeUnit = function(str) {
	if(typeof str !== 'string'){
		return str;
	}
	return Number(str.replace(/[^-\d\.]/g, ''));
};
BZS.cleanNumber = function(str) {
	return Math.round(BZS.removeUnit(str));
};

jQuery.fn.extend({
	getPaddingBox : function() {
		return {
			top : BZS.cleanNumber(this.css('paddingTop')),
			bottom : BZS.cleanNumber(this.css('paddingBottom')),
			left : BZS.cleanNumber(this.css('paddingLeft')),
			right : BZS.cleanNumber(this.css('paddingRight'))
		};
	},
	getMarginBox : function() {
		return {
			top : BZS.cleanNumber(this.css('marginTop')),
			bottom : BZS.cleanNumber(this.css('marginBottom')),
			left : BZS.cleanNumber(this.css('marginLeft')),
			right : BZS.cleanNumber(this.css('marginRight'))
		};
	}
});

BZS.app.tools.hoverOutline = (function () {
	var $element = $('#hover-outline');
	return {
		show : function (clientRect , tag) {
			$element.css({
				'width' : clientRect.width,
				'height' : clientRect.height,
				'transform' : 'translate('+Math.round(clientRect.left + 1)+'px, '+Math.round(clientRect.top + 1)+'px)'
			}).show();
			$element.find('.tagname').html(tag);
		},
		hide : function () {
			$element.hide();
		}
	};
})();

BZS.app.tools.selectOutline = (function () {
	var $element = $('#selected-outline');
	return {
		show : function (clientRect , tag) {
			$element.css({
				'width' : clientRect.width,
				'height' : clientRect.height,
				'transform' : 'translate('+Math.round(clientRect.left + 1)+'px, '+Math.round(clientRect.top + 1)+'px)'
			}).show();
			$element.find('.tagname').html(tag);
		},
		hide : function () {
			$element.hide();
		}
	};
})();

BZS.app.tools.paddingOverlay = (function () {
	var $element = $('#padding-overlay');
	return {
		show : function (clientRect , padding) {

			var $padTop = $element.find('.pad-top');
			var $padBottom = $element.find('.pad-bottom');
			var $padLeft = $element.find('.pad-left');
			var $padRight = $element.find('.pad-right');
			var $padInner = $element.find('.pad-inner');

			$([$element,$padTop,$padBottom,$padLeft,$padRight,$padInner]).each(function(){
				this.attr('style', null);
			});

			$element.css({
				'width' : clientRect.width - 2,
				'height' : clientRect.height - 2,
				'transform' : 'translate('+Math.round(clientRect.left + 2)+'px, '+Math.round(clientRect.top + 2)+'px)'
			});

			if(padding.top){
				$padTop.height(padding.top);
				$padTop.css({
					left : padding.left,
					right : padding.right
				});
			} else {
				$padTop.height(0);
				$padInner.css('borderTop', 'none');
			}
			if(padding.bottom){
				$padBottom.height(padding.bottom);
				$padBottom.css({
					left : padding.left,
					right : padding.right
				});
			} else {
				$padBottom.height(0);
				$padInner.css('borderBottom', 'none');
			}
			if(padding.right){
				$padRight.width(padding.right);
			} else {
				$padRight.width(0);
				$padInner.css('borderRight', 'none');
			}
			if(padding.left){
				$padLeft.width(padding.left);
			} else {
				$padLeft.width(0);
				$padInner.css('borderLeft', 'none');
			}

			$padInner.css({
				top:padding.top-1,
				left:padding.left-1,
				right:padding.right-1,
				bottom:padding.bottom-1
			});

			$element.show();
		},
		hide : function () {
			$element.hide();
		}
	};
})();

BZS.app.tools.marginOverlay = (function () {
	var $element = $('#margin-overlay');
	return {
		show : function (clientRect , margin) {

			var $marginTop = $element.find('.margin-top');
			var $marginBottom = $element.find('.margin-bottom');
			var $marginLeft = $element.find('.margin-left');
			var $marginRight = $element.find('.margin-right');



			$([$element,$marginTop,$marginBottom,$marginLeft,$marginRight]).each(function(){
				this.attr('style', null);
			});

			var translateX = clientRect.left - margin.left;
			var translateY = clientRect.top - margin.top;

			$element.css({
				'width' : clientRect.width + margin.left + margin.right,
				'height' : clientRect.height + margin.top + margin.bottom,
				'transform' : 'translate('+Math.round(translateX+1)+'px, '+Math.round(translateY+1)+'px)'
			});

			if(margin.top){
				$marginTop.height(margin.top-1);
				$marginTop.css({
					left : margin.left -1 ,
					right : margin.right-1
				})
			} else {
				$marginTop.height(0);
				$element.css('borderTop', 'none');
			}
			if(margin.bottom){
				$marginBottom.height(margin.bottom-1);
				$marginBottom.css({
					left : margin.left-1,
					right : margin.right-1
				});
			} else {
				$marginBottom.height(0);
				$element.css('borderBottom', 'none');
			}
			if(margin.right){
				$marginRight.width(margin.right-1);
			} else {
				$marginRight.width(0);
				$element.css('borderRight', 'none');
			}
			if(margin.left){
				$marginLeft.width(margin.left-1);
			} else {
				$marginLeft.width(0);
				$element.css('borderLeft', 'none');
			}


			$element.show();
		},
		hide : function () {
			$element.hide();
		}
	};
})();

(function() {

	var controllsSlector = '.editor-mode *:not([data-bzs-ignore])';
	var workingDocument = null;
	var selectedElement = null;
	var dragging = false;

	$('#workspace').on('load', function () {
		workingDocument = $('#workspace').contents();

		workingDocument.on('scroll', function () {
			if(selectedElement){
				var $this = selectedElement;
				$this.addClass('bzs-affected');

				var rect = selectedElement.get(0).getBoundingClientRect();
				BZS.app.tools.selectOutline.show(rect);
			}
			BZS.app.tools.hoverOutline.hide();
			BZS.app.tools.paddingOverlay.hide();
			BZS.app.tools.marginOverlay.hide();
		});


		workingDocument.on('click', controllsSlector , function(e) {
			e.preventDefault();
			e.stopPropagation();
			workingDocument.find('.bzs-affected').removeClass('bzs-affected');
			var $this = $(this);

			selectedElement = $this;
			$this.addClass('bzs-affected');

			var rect = this.getBoundingClientRect();
			BZS.app.tools.hoverOutline.hide();
			BZS.app.tools.paddingOverlay.hide();
			BZS.app.tools.marginOverlay.hide();
			BZS.app.tools.selectOutline.show(rect,this.tagName);
		});

		workingDocument.on('mouseover', controllsSlector , function(e) {
			e.preventDefault();
			e.stopPropagation();

			if(dragging)
				return !dragging;

			var $this = $(this);
			if($this.hasClass('bzs-affected')){
				BZS.app.tools.hoverOutline.hide();
				BZS.app.tools.paddingOverlay.hide();
			} else {
				var rect = this.getBoundingClientRect();
				BZS.app.tools.hoverOutline.show(rect,this.tagName);
				var paddingBox = $this.getPaddingBox();
				var marginBox = $this.getMarginBox();
				BZS.app.tools.paddingOverlay.show(rect,paddingBox);
				BZS.app.tools.marginOverlay.show(rect,marginBox);
			}

		});

		workingDocument.on('mouseout', controllsSlector, function(e) {
			e.preventDefault();
			e.stopPropagation();
			BZS.app.tools.hoverOutline.hide();
			BZS.app.tools.paddingOverlay.hide();
			BZS.app.tools.marginOverlay.hide();
		});

		var dragStatus = {};

		var onDrag = function (e) {
			e.preventDefault();
			e.stopPropagation();
			dragging = true;
			if(!(e.altKey || e.ctrlKey)) {
				var newCss = {
					marginTop : dragStatus.start.margin.top,
					marginLeft : dragStatus.start.margin.left,
				}
				dragStatus.el.css(newCss);
				return false;
			}
			var distance = {
				x : e.clientX - dragStatus.start.x,
				y : e.clientY - dragStatus.start.y
			};
			var newCss = {
				marginTop : dragStatus.start.margin.top,
				marginLeft : dragStatus.start.margin.left
			};
			if(e.altKey) {
				newCss.marginTop += distance.y;
			}
			if(e.ctrlKey) {
				newCss.marginLeft += distance.x;
			}
			dragStatus.el.css(newCss);
			var rect = dragStatus.el.get(0).getBoundingClientRect();
			var marginBox = dragStatus.el.getMarginBox();
			BZS.app.tools.marginOverlay.show(rect,marginBox);
			BZS.app.tools.selectOutline.show(rect,dragStatus.el.get(0).tagName);
		};

		var onDragEnd = function (e) {
			e.preventDefault();
			e.stopPropagation();
			dragging = false;
			workingDocument.off('mousemove', onDrag);
			workingDocument.off('mouseup', onDragEnd);
		};

		workingDocument.on('mousedown', controllsSlector , function (e) {
			e.preventDefault();
			e.stopPropagation();

			var $this = $(this);

			dragStatus.start = {
				x : e.clientX,
				y : e.clientY,
				margin : $this.getMarginBox()
			};
			dragStatus.el = $this;
			BZS.app.tools.hoverOutline.hide();
			BZS.app.tools.paddingOverlay.hide();
			workingDocument.on('mousemove', onDrag);
			workingDocument.on('mouseup', onDragEnd);
		});

	});


	$element = $('#element');

	$('input#margin').on('input', function (e) {
		var val = $(this).val();
		//var selectedElement = $element;
		if($.trim(val) !== '') {
			selectedElement.css('margin' , val + 'px');
		} else {
			selectedElement.css('margin' ,'');
		}
	});

	$('input#padding').on('input', function (e) {
		var val = $(this).val();
		//var selectedElement = $element;
		if($.trim(val) !== '') {
			selectedElement.css('padding' , val + 'px');
		} else {
			selectedElement.css('padding' ,'');
		}
	});

})();

