// app
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 100;
const colorArray = ['#ffffff', '#ccc','#0cce6b', '#dced31', '#ef2d56', '#ed7d3A', '#7d3Aed'];
// const colorArray = ['white','green', 'red', 'blue', 'orange', 'yellow', 'grey'];
let score =0;
let columns = 10;
let gameGrid = new Array();
let rows = Math.floor(h / (w / columns));
let squaresize = (w / columns);
let completedlevel = false;
let level = 1;
let digger = {
	x: 0,
	y: 0
}
let changedblocks = new Array();
function blocksSetup() {
	for (var i = 0; i < columns; i++) {
		let columnArray = new Array();
		for (var j = 0; j < rows; j++) {
			let block = {
				x: i,
				y: j,
				color: j == 0 ? 0: (Math.floor(Math.random() * (colorArray.length-1)) + 1)
			};

			columnArray.push(block);
		}
		gameGrid.push(columnArray);
	}
}
function drawblocks() {
	for (var i = 0; i < columns; i++) {
		for (var j = 0; j < rows; j++) {
			let blockcolor = gameGrid[i][j].color;
			let x = gameGrid[i][j].x  * squaresize;
			let y = gameGrid[i][j].y  * squaresize;
			let color = blockcolor == 9 ? '#000' : colorArray[blockcolor]; 
			fill(color);
			stroke('#fff');
			strokeWeight(2);
			rect(x, y, squaresize, squaresize, 4);
		}
	}
}
function right() {
	// refactor to dig
	let rightColor = digger.x + 1 < columns ? gameGrid[digger.x + 1][digger.y].color : 1;
	if (digger.x < (columns - 1) && rightColor != 1) {
		let target = gameGrid[digger.x+1][digger.y];
		let targetGroup = findTargets(target);
		digger.x += 1;
		background('#fff');
		checkDiggerFall();
		checkBlockFall();
		redraw();
	}

};
function down() {
	// dig
	let bottomColor = digger.y + 1 < rows ? gameGrid[digger.x][digger.y + 1].color : 1;
	if (digger.y < rows && bottomColor != 1) {
		// dig!!!!
		let target = gameGrid[digger.x][digger.y + 1];
		let targetGroup = findTargets(target);


		background('#fff');
		checkDiggerFall();
		checkBlockFall();
		redraw();
	}
};
function left() {
	// refactor to dig
	let leftColor = digger.x > 0 ? gameGrid[digger.x - 1][digger.y].color : 1;
	if (digger.x > 0 && leftColor != 1) {
		let target = gameGrid[digger.x-1][digger.y];
		let targetGroup = findTargets(target);
		digger.x -= 1;
	}

	background('#fff');
	checkDiggerFall();
	checkBlockFall();
	redraw();
};
function drawDigger() {
	// check for falling and adjust
	fill('#fff');
	stroke('#bada55');
	strokeWeight(1);
	rect(digger.x * squaresize, digger.y * squaresize, squaresize, squaresize, 0);
}
function setup() {
	createCanvas(w, h);
	blocksSetup();
	noLoop();
}
function complete() {
	level++;
	document.getElementById('win').classList.add("open");
	document.getElementById('level').innerHTML = level;
	document.getElementById('levelscore').innerHTML = score;
	completedlevel=false;
	digger = {
		x: 0,
		y: 0
	}
	gameGrid = new Array();

	columns += 1;
	gameGrid = new Array();
	rows = Math.floor(h / (w / columns));
	squaresize = (w / columns);
	console.log('columns, rows',columns, rows)
	blocksSetup();

	drawblocks();
	drawDigger();
}
function closeLB() {
	document.getElementById('win').classList.remove("open");
}
function checkDiggerFall() {
	// win if y too big
	while (digger.y < rows - 1 && gameGrid[digger.x][digger.y + 1].color == 0) {
		digger.y = digger.y + 1;
	}
		if (digger.y + 1 == rows) {
			console.log("complete");
			completedlevel = true;
		}
};
function checkBlockFall() {
	let changed = 1;
	let overflowbuff = 0;
	// only run on changed colums: changedblocks
	let uniqueChangedBlocks = [...new Set(changedblocks)];
	changedblocks = [];
	while (changed > 0 && overflowbuff < 200) {
		overflowbuff++;
		changed = 0;
		uniqueChangedBlocks.forEach(function(element, index) {
			gameGrid[index].forEach(function(subelement, subindex) {
				var support = findsupport(subelement);   /// here
				if (subindex < rows - 1 && gameGrid[element][subindex].color != 0 && gameGrid[element][subindex + 1].color == 0 && support == false) {
					let oldColor = gameGrid[element][subindex].color;
					gameGrid[element][subindex].color = 0;
					gameGrid[element][subindex + 1].color = oldColor;
					changed++;
				}
			});
		});
		if(overflowbuff > 180) {
			console.log('fucked', changed)
		}
	}
};
function findsupport(target){
	supportstate = false
	tarXLeft = target.x - 1;
	tarXRight = target.x + 1;
	return false; // remove for supports
	while (tarXLeft > 0 && gameGrid[tarXLeft][target.y].color == target.color) {
		if (target.y < rows - 2 && gameGrid[tarXLeft][target.y + 1].color != 0) {
			return true;
		} else {
			tarXLeft--;
		}
	}

	while (tarXRight < columns - 1 && gameGrid[tarXRight][target.y].color == target.color) {
		if (target.y > 1 && gameGrid[tarXRight][target.y - 1].color != 0) {
			return true;
		} else {
			tarXRight++;
		}
	}

	return supportstate;
};
function checkDiggerDeath() {
	console.log('lets see if digger died drops');
};

function findTargets(target) {
	let targets = new Array();
	targets.push(target);
	let targetfindcounter = 0;
	let targetloopcounter = 0;
	if (target.color != 0 && target.color != 1) {
		while (targets.length > 0) {
			targetloopcounter++;
			targets.forEach(function(element, index) {
				targetfindcounter++;
				tarX = element.x;
				tarY = element.y;
				tarcolor = element.color;
				targets.splice(index, 1);
	  			gameGrid[tarX][tarY].color = 0;
	  			changedblocks.push(tarX);
	  			score += (1 * targetfindcounter);
	  			if (tarX < columns - 1 && gameGrid[tarX + 1][tarY].color == tarcolor && tarcolor != 0) {
	  				targets.push(gameGrid[tarX + 1][tarY]);
	  			}
	  			if (tarX > 0 && gameGrid[tarX - 1][tarY].color == tarcolor && tarcolor != 0) {
	  				targets.push(gameGrid[tarX - 1][tarY]);
	  			}
	  			if (tarY < rows - 1 && gameGrid[tarX][tarY + 1].color == tarcolor && tarcolor != 0) {
	  				targets.push(gameGrid[tarX][tarY + 1]);
	  			}
	  			if (tarY > 0 && gameGrid[tarX][tarY - 1].color == tarcolor && tarcolor != 0) {
	  				targets.push(gameGrid[tarX][tarY - 1]);
	  			}
			});
		}
		
	} else {
		console.log('target is white')
	}
	//console.log('targetfindcounter',targetfindcounter, 'targetloopcounter', targetloopcounter);
};
function draw() {
	// circles();
	// lines();
	updateScore();
	checkDiggerDeath();
	drawblocks();
	drawDigger();
	if (completedlevel) {
		complete();
	}
	let topColor = digger.y > 0 ? gameGrid[digger.x][digger.y - 1].color : 0;
	let rightColor = digger.x + 1 < columns ? gameGrid[digger.x + 1][digger.y].color : 0;
	let bottomColor = digger.y + 1 < rows ? gameGrid[digger.x][digger.y + 1].color : 0;
	let leftColor = digger.x > 0 ? gameGrid[digger.x - 1][digger.y].color : 0;
	//console.log(topColor,rightColor,bottomColor,leftColor);
}
function updateScore() {
	document.getElementById("score").innerHTML = score; 
}
function restart() {
	location.reload(); 
}