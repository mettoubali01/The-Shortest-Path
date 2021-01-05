var rows = 25;
var cols = 25;
var grid = new Array(cols);
var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path = [];
var noSolution = false;

function Spot(i, j){

	this.i = i;
	this.j = j;
	this.f = 0;
	this.g = 0;
	this.h = 0;
	this.neighbors = []
	this.previous =  undefined;
	this.wall = false;

	if (random(1) < 0.3) {
		this.wall = true;
	}

	this.show = function(color, startEnd) {
		fill(color)
		if (this.wall) {
			fill(0)
		}
		noStroke()
		//to control the size w/2, h/2 smaller
		//to center the object + w / 2
		if (startEnd === grid[this.i][this.j]) 
			ellipse(this.i * w + w / 2, this.j * h + h / 2, w-1, h-1);
		else
			ellipse(this.i * w + w / 2, this.j * h + h / 2, w/2, h/2);
	} 

	this.addNeighbors = function(grid){
		var i = this.i;
		var j = this.j;
		
		if (i < cols -1) {
			this.neighbors.push(grid[i+1][j])
		}
		if (i > 0) {
			this.neighbors.push(grid[i-1][j])
		}
		if (j < rows -1) {
			this.neighbors.push(grid[i][j+1])
		}
		if (j > 0) {
			this.neighbors.push(grid[i][j-1])
		}
	}

}

function heurisitic(current, end){
	//return the distance betwwen the two points
	//Euclidean distance
	//dist(current.i, current.j, end.i, end.j) 
	//manhattan distance formula
	var d = abs(current.i - end.i) + abs(current.j - end.j);

	return d;
}

function removeFromArray(arr, elt){
	for (var i = arr.length - 1; i >= 0; i--) {
		if(arr[i] == elt){
			arr.splice(i, 1);
		}
	}
}

function addRestartButton(){
	$("#result").after("<button type='submit' class='button'>Start again</button> ");
		$('button').click(function() {
    		location.reload();
		});
}

function setup(){
	createCanvas(500, 600);

	w = width / cols;
	h = height / rows;

	//making a 2D Array
	for (var i = 0; i < cols ; i++) {
		grid[i] = new Array(rows)
	}

	//initializing the grid with spots object
	for (var i = 0; i < cols ; i++) {
		for (var j = 0; j < rows ; j++) {
			grid[i][j] = new Spot(i, j); 
		}
	}

	//adding nwighbor to each spot/cell
	for (var i = 0; i < cols ; i++) {
		for (var j = 0; j < rows ; j++) {
			grid[i][j].addNeighbors(grid)

		}
	}

	//giving random position to the start and the end spots
	var startI = Math.floor(Math.random() * cols);
	var startJ = Math.floor(Math.random() * cols);
	var endI = Math.floor(Math.random() * cols);
	var endJ = Math.floor(Math.random() * cols);
	start = grid[startI][startJ];
	end = grid[endI][endJ];

	//to avoid putting a wall in start and in the end spot position
	start.wall = false;
	end.wall = false;

	openSet.push(start);

}

function draw(){
	
	if(openSet.length > 0){

		//taking the spot with the less f 
		var winner = 0;
		for (var i = 0; i < openSet.length; i++) {
			if (openSet[i].f < openSet[winner].f) {
				winner = i;
			}
		}
		var current = openSet[winner];
		if (current === end) {
			//find the path
			noLoop();
			$("#result").text(String.fromCodePoint(0x1F60A) +" YEAAAHHH!!!. THE PATH IS FOUND");
			addRestartButton();
			console.log("Done");
		}

		removeFromArray(openSet, current);
		closedSet.push(current);

		var neighbors = current.neighbors;

		for (var i = 0; i < neighbors.length; i++) {
			var neighbor = neighbors[i];
			if (!closedSet.includes(neighbor) && !neighbor.wall) {
				var tempG = current.g + 1;

				var newPath = false;
				if (openSet.includes(neighbor)) {
					//to take the neighbor with the less g(cost)
					if (tempG < neighbor.g) {
						neighbor.g = tempG;
						newPath = true;
					}
				}else{
					neighbor.g = tempG;
					newPath = true;
					openSet.push(neighbor);
				}
				if (newPath) {
					neighbor.h = heurisitic(neighbor, end);
					neighbor.f = neighbor.g + neighbor.h;
					neighbor.previous = current;
				}
			}
		}
		
	}else{
		//No solution
		console.log("no solution");
		$("#result").text(String.fromCodePoint(0x1F62F) + " Oooopppsss!!! THERE IS NO PATH TO GET TO THE END POINT!!!");
		addRestartButton();
		noSolution = true;
		noLoop();
	}

	background(255)

	//giving colors to start and the end spot to deferenciate them from the other
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			if (grid[i][j] != end && grid[i][j] != start) {
				grid[i][j].show(color(255));	
			}else if (grid[i][j] == end) {
				end.show(color(255, 204, 0), end)		
				$("#end").css("background-color", "rgba(255, 204, 0)");
			} else if(grid[i][j] == start){
				start.show('#fae', start)
				$("#start").css("background-color", "#fae");
			}
		}
	}

	//the checked spots
	for (var i = 0; i < closedSet.length; i++) {
		if (closedSet[i] != start && closedSet[i] != end) 
			closedSet[i].show(color(255,0,0));
	}

	//the spots those not checked and the have not the less cost
	for (var i = 0; i < openSet.length; i++) {
		openSet[i].show(color(0,255,0));
	}

	//we build the shortest path when the searching is finished
	if (!noSolution) {
		path = []
		var temp = current;
		path.push(temp);
		console.log("if path " + path.length + " i " + temp.i + " j " + temp.j);
		while(temp.previous){
			path.push(temp.previous);
			temp = temp.previous;
			console.log("inside path " + path.length + " i " + temp.i + " j " + temp.j);

		}
	}
	//printing the shortest path
	noFill();
	stroke(color('blue'));
	strokeWeight(w/2)
	beginShape();
	for (var i = 0; i < path.length; i++) {
		if (path[i] != start && path[i] != end) 
			vertex(path[i].i * w + w/2, path[i].j * h + h/2);
	}
	endShape();
} 