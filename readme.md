Author: TCPN
Latest Updated: 2017/04/14

**issues:**
1. measures
2. note edit, delete
 - has cursor
 - can delete, insert note before cursor
 - can move cursor
 2.1 when tied latter note deleted, the former need to bedetected and changed
 2.2 when tie mode is on, if the input note can't be tied to the previous note, tie mode won't stop
3. tab for display screens 
 - the editing panel
 - tab label row
 3.1 need to design other panel: measure setting, other info
4. length pad size adjust
 - wrap to more lines when under mobile portrait view
5. shrink elements in ABC note edit screen when user zoom in
6. Note Display Problem
 6.1 display triplet notes in the right way
 6.2 make two note stick together or seperated by a space
7. copy button to copy written melody text in ABC notation
8. a screen to show converted score by abcjs or other tools

* ISSUE: when changing time signature and beats, notes setting, which one should be kept?
    the ratio of note duration to measure duration
	the note length mark (half, quarter, eighth)
* ISSUE: due to the .note using display: inline-block, a very long note will have the
	cursor floating beside the right border
	like:
	C4-|C4-|C4-|
	C4          |
	            ^crsor
	POSSIBLE SOLUTION:
		make each partition a inline-block, rather than one note

- fix piano key display, borders, width and height after resize, 
- reduce piano keyboard height to avoid the problem that address bar take some space

+ measure added
  + time signature setting
  + shows measure lines according to specific number of beats per measure(time signature)
  + visually seperate notes that cross measure lines into parts
  + when change time signature, notes change appearances according to Beats/measure
  > adjust the note unit in ABC (but not change the BPMsr)
  > upbeat measure setting
  > playing speed setting
  > design a better layout for time tab, (time signature, upbeat setting, speed setting, unit beat setting)
  > should a eighth note in 6/8 be denoted by a tap on 1/6 or 1/8?
  > display triplet notes together
  ! tied notes and parts of a note seperated by measure line looks different! order of '-' and '|' diff
  ! G8// ? F24// ? these are weird notes under time 9/8
  ! 5beat can be correctly shown when paste to the abcjs, need To break down
  
  
+ copy button
  * use some icon image on the edit buttons
  > input or paste function (imply parse ABC!!!)
  > show the render result of abcjs in a tab
  > button to seperate/stick notes
  > ? change line

+ make cursor always scroll into view
  > don't scroll into view when user scroll
  ! ? cursor can go before the first note, and will jump to the end as a result
  
+ can choose which length you want to use
  + some codes to handle the layout of length buttons

