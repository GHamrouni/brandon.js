/*-----------------------------------------------------------------*/
/*                                                                 */
/*       brandon.js : The brand name generator                     */
/*                                                                 */
/*       Licensed under the MIT license                            */
/*                                                                 */
/*       Ghassen Hamrouni 2012                                     */
/*                                                                 */
/*******************************************************************/

var brandon = {};

brandon.version = "0.1.4";

/**
 * A priority queue based on binary-heap.
 */
brandon.PriorityQueue = function (size) {
    "use strict";

    var buffer          = [],
        max_size        = size,
        filled_elements = 0;

    /**
     * Returns the parent index based on the child 
     * index, if the child has no parent a negative
     * index is returned.
     */
    this.getParentIndex = function (i) {
        return Math.floor((i - 1) / 2);
    };

    /**
     * Returns the right-child index based on the parent 
     * index.
     */
    this.getRChildIndex = function (i) {
        return 2 * i + 2;
    };

    /**
     * Returns the left-child index based on the parent 
     * index.
     */
    this.getLChildIndex = function (i) {
        return 2 * i + 1;
    };

    /**
     * Get the internal buffer
     */
    this.getBuffer = function () {
        return buffer;
    };

    /**
     * Balance the heap, to keep the proper ordering 
     * of the elements.
     */
    this.balanceHeap = function () {
        var i = filled_elements - 1,
            value = 0;

        while (this.getParentIndex(i) >= 0 && buffer[i].key > buffer[this.getParentIndex(i)].key) {
            value = buffer[i];
            buffer[i] = buffer[this.getParentIndex(i)];
            buffer[this.getParentIndex(i)] = value;

            i = this.getParentIndex(i);
        }
    };

    /**
     * Balance the heap, to keep the proper ordering 
     * of the elements.
     */
    this.balanceChildren = function (i) {
        var mc = 0,
            rc = this.getRChildIndex(i),
            lc = this.getLChildIndex(i),
            value = 0;

        if (lc >= filled_elements) {
            return;
        }

        if (rc < filled_elements) {
            if (buffer[rc].key > buffer[lc].key) {
                mc = rc;
            } else {
                mc = lc;
            }
        } else {
            mc = lc;
        }

        if (buffer[mc].key > buffer[i].key) {
            value = buffer[mc];
            buffer[mc] = buffer[i];
            buffer[i] = value;

            this.balanceChildren(mc);
        }
    };

    /**
     * Remove the maximal element from the queue
     */
    this.removeMax = function () {
        if (filled_elements <= 0) {
            return;
        }

        buffer[0] = buffer[filled_elements - 1];
        filled_elements = filled_elements - 1;

        this.balanceChildren(0);
    };

    /**
     * Get the maximal element of the queue
     */
    this.getMax = function () {
        return buffer[0];
    };

    /**
     * Returns true if the priority queue is 
     * full
     */
    this.isFilled = function () {
        return filled_elements >= max_size;
    };

    /*
     * Insert an new element to the priority queue
     */
    this.insert = function (key, value) {
        if (filled_elements === 0) {
            filled_elements = 1;
            buffer.push({ key: key, value: value });
            return;
        }

        if (filled_elements < max_size) {
            buffer.push({ key: key, value: value });
            filled_elements += 1;

            this.balanceHeap();

            return;
        }

        buffer[0] = { key: key, value: value };
        this.balanceChildren(0);
    };
};

/* Randomly generate a string of specified size */
brandon.randomString = function (size, alphabet) {
    "use strict";

    var str = '',
        i = 0,
        n = 0;

    for (i = 0; i < size; i += 1) {
        n = Math.floor(Math.random() * alphabet.length);
        str += alphabet[n];
    }

    return str;
};

// The training set contains a collection of names
// used to train the model
brandon.SolutionSet = function (alph, maxStrSize) {
    "use strict";

    var solutionSet = [],
        alphabet    = alph,
        maxStringSize = maxStrSize;

    this.add = function (elem) {
        solutionSet.push(elem);
    };
    this.getAt = function (index) {
        return solutionSet[index];
    };
    this.generate = function (maxStringSize, populationSize) {

        solutionSet = [];
        var i    = 0,
            elem = '';

        for (i = 0; i < populationSize; i += 1) {
            elem = brandon.randomString(maxStringSize, alphabet);
            solutionSet.push(elem);
        }
    };
    this.size = function () {
        return solutionSet.length;
    };
    //Find solutions using the Monte Carlo method
    this.findSolutions = function (energyFunction, itemsNb, iterationNb) {
        var solutions = new brandon.PriorityQueue(itemsNb),
            i = 0,
            k = 0;
        for (i = 0; i < iterationNb; i += 1) {
            this.generate(maxStringSize, itemsNb * 10);

            for (k = 0; k < solutionSet.length; k += 1) {
                var word   = solutionSet[k],
                    energy = energyFunction.energy(word);

                if (solutions.isFilled()) {
                    if (solutions.getMax().key > energy) {
                        solutions.insert(energy, word);
                    }
                } else {
                    solutions.insert(energy, word);
                }
            }
        }
        return solutions.getBuffer();
    };
};

brandon.BuildAlphabetLookupTable = function (alph) {
    var maxIndex = alph.charCodeAt(0),
        i        = 0,
        j        = 0,
        k        = 0;
        
    for (j = 0; j < alph.length; j += 1) {
        if (alph.charCodeAt(j) > maxIndex)
            maxIndex = alph.charCodeAt(j);
    }
    
    var lookupTable = new Array(maxIndex + 1);
    
    for (k = 0; k <= maxIndex; k += 1) {
        lookupTable[k] = -1;
    }
    
    for (i = 0; i < alph.length; i += 1) {
        lookupTable[alph.charCodeAt(i)] = i;
    }
    
    return lookupTable;
};

// 3-gram distribution
// TODO: Solve the smoothing issues ...
brandon.TriGram = function (alph) {
    "use strict";

    var charFrequency       = new Array(alph.length),
        pairFrequency       = new Array(alph.length),
        trigramFrequency    = new Array(alph.length),
        indexTable          = brandon.BuildAlphabetLookupTable(alph),
        n                   = alph.length,
        alphabet            = alph,
        F1                  = 0,
        F2                  = 0,
        F3                  = 0,
        i                   = 0,
        j                   = 0,
        k                   = 0;

    for (i = 0; i < alphabet.length; i += 1) {
        charFrequency[i] = 0.0;
        pairFrequency[i] = new Array(alphabet.length);
        trigramFrequency[i] = new Array(alphabet.length);
    
        for (j = 0; j < alphabet.length; j += 1) {
            pairFrequency[i][j] = 0.0;
            trigramFrequency[i][j] = new Array(alphabet.length);

            for (k = 0; k < alphabet.length; k += 1) {
                trigramFrequency[i][j][k] = 0.0;
            }
        }
    }
    
    this.extractFrequencies = function (word) {
        for (i = 0; i < word.length; i += 1) {
            var v = indexTable[word.charCodeAt(i)],
                u = 0,
                w = 0;

            charFrequency[v] += 1.0;

            if (i > 0) {
                u = indexTable[word.charCodeAt(i - 1)];
                pairFrequency[u][v] += 1.0;

                if (i > 1) {
                    w = indexTable[word.charCodeAt(i - 2)];
                    trigramFrequency[w][u][v] += 1.0;
                }
            }
        }

        for (i = 0; i < alphabet.length; i += 1) {
            F1 += charFrequency[i];

            for (j = 0; j < alphabet.length; j += 1) {
                F2 += pairFrequency[i][j];

                for (k = 0; k < alphabet.length; k += 1) {
                    F3 += trigramFrequency[i][j][k];
                }
            }
        }
    };
    this.add = function (word) {
        this.extractFrequencies(word);
    };
    this.build = function (elems) {
        for (i = 0; i < elems.length; i += 1) {
            this.extractFrequencies(elems[i]);
        }
    };
    this.probability1 = function (word) {
        if (word.length === 1) {
            var x = indexTable[word.charCodeAt(0)];
            return charFrequency[x];
        }
        return 0;
    };
    this.probability2 = function (word) {
        if (word.length === 2) {
            var x = indexTable[word.charCodeAt(0)],
                y = indexTable[word.charCodeAt(1)];
            return pairFrequency[x][y];
        }
        return 0;
    };
    this.probability3 = function (word) {
        if (word.length === 3) {
            var x = indexTable[word.charCodeAt(0)],
                y = indexTable[word.charCodeAt(1)],
                z = indexTable[word.charCodeAt(2)];
            return trigramFrequency[x][y][z];
        }
        return 0;
    };
    this.conditionalprobability3 = function (c, word) {
        var p1 = this.probability3(word + c),
            p2 = this.probability2(word);
        // Apply smoothing
        return (p1 + 1.0) / (p2 + n * n * n);
    };
    this.probability = function (word) {
        var p = 1;

        if (word.length === 0) {
            return 0;
        }

        if (word.length === 1) {
            return this.probability1(word);
        }

        if (word.length === 2) {
            return this.probability2(word);
        }

        if (word.length === 3) {
            return this.probability3(word);
        }

        var p3 = (this.probability3(word.substring(0, 3)) + 1) / (F3 + n * n * n);

        for (i = 3; i < word.length; i += 1) {
            var c = word[i],
                txt = word.substring(i - 2, i),
                val = this.conditionalprobability3(c, txt);
            p = p * val;
        }

        return p * p3;
    };
    this.energy = function (word) {
        var p = this.probability(word);

        return -Math.log(p);
    };
};

/*
 * Extract the vowel structure, for example the
 * vowel structure of the word KATA is obtained
 * as follow :  |K|A|T|A|
 *              |_|A|_|A|
 */

brandon.VowelStructure = function () {
    "use strict";

    var structures     = {};
    var vowels         = {};

    // TODO replace this inefficient implementation
    // with a real hash set !
    vowels['a'] = 1;
    vowels['e'] = 1;
    vowels['i'] = 1;
    vowels['o'] = 1;
    vowels['u'] = 1;
    vowels['y'] = 1;

    this.isVowel = function (word) {
        if (vowels[word]) {
            return true;
        }

        return false;
    };
    this.extractVowels = function (w) {
        var s = '',
            i = 0;

        for (i = 0; i < w.length; i += 1) {
            if (this.isVowel(w[i])) {
                if (!(s == '') && w[i - 1] != w[i]) {
                    s = s + "-" + w[i];
                } else {
                    s = s + w[i];
                }
            }
        }

        return s;
    };
    this.structureExists = function (w) {
        if (w == '') {
            return false;
        }

        if (structures[w]) {
            return true;
        }

        return false;
    };
    this.add = function (w) {
        var v = this.extractVowels(w);

        if (v == '') {
            return;
        }

        if (!this.structureExists(v)) {
            structures[v] = 1;
        } else {
            structures[v] += 1;
        }
    };
    this.build = function (elems) {
        for (var i = 0; i < elems.length; i += 1) {
            this.add(elems[i]);
        }
    };
    this.normalize = function () {
        var N = 0;

        for (var key in structures) {
           var v = structures[key];

           N += v;
        }

        if (N > 0) {
            for (var key in structures) {
               structures[key] = structures[key]/N;
            }
        }
    };
    this.energy = function (w) {
        var v = this.extractVowels(w);

        if (!this.structureExists(v)) {
            return -Math.log(0.0001);
        }

        return -Math.log(structures[v]);
    };
};

brandon.NameGenerator = function (alphabet) {
    "use strict";

    var vstructure = new brandon.VowelStructure(),
        trigram    = new brandon.TriGram(alphabet);

    this.build = function (elems) {
        for (var i = 0; i < elems.length; i += 1) {
            vstructure.add(elems[i]);
            trigram.add(elems[i]);
        }
    };

    this.energy = function (w) {
        return  vstructure.energy(w) + trigram.energy(w);
    };
};
