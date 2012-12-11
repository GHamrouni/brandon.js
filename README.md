brandon.js : The brand name generator    
============

You must already have spent a lot of time searching for THE suitable
title your project should have. The main problem with this task is 
that usually the names you chose already exist, the best way might be
to have a lot of good sounding names generated automatically and then
all you’ll have to do is choose. 

This little library automates the task of generating good sounding names
given a set of chosen words.

Using this library
------------------

	var text =  "Jacob Sophia Mason Isabella William Emma " + 
				"Jayden Olivia Noah Ava Michael Emily Ethan Abigail " + 
				"Alexander Madison Aiden Mia Daniel Chloe";
	
	var trainingSet = text.split(/\b\s+/);

	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	// Create a solution set of words containing 4 characters
	var solutionSet = new brandon.SolutionSet(alphabet, 4);

	var ngen = new brandon.NameGenerator(alphabet);
	
	ngen.build(trainingSet);

	// Generate five candidates using 3000 iterations !
	var solutions = solutionSet.findSolutions(ngen, 5, 3000);

	var sbuffer = [];

	for (var i = 0; i < solutions.length; i += 1)
	{
		sbuffer.push(solutions[i].value);
	}

	// Print the output
	alert(sbuffer);