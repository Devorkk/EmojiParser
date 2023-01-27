window.onload = function () {
    let emojis

    fetch('https://raw.githubusercontent.com/Devorkk/EmojiParser/main/source/scripts/emoji-list.json')
        .then(response => response.json())
        .then(data => {
            emojis = data

            function findAll(regexPattern, sourceString) {
                let output = [],
                    match

                let regexPatternWithGlobal = RegExp(regexPattern, [...new Set('g' + regexPattern.flags)].join(""))
                while (match = regexPatternWithGlobal.exec(sourceString)) {
                    delete match.input
                    output.push(match)
                }
                return output
            }

            function replacePattern(element, from, to) {
                if (element.childNodes.length) {
                    element.childNodes.forEach(child => replacePattern(child, from, to));
                } else {
                    const cont = element.textContent;
                    if (cont) element.textContent = cont.replace(from, to);
                }
            }

            function reverseParseEmoji(input) {
                let pattern = []

                findAll(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, input.value)
                    .forEach(patterns => pattern.push(patterns[0]))

                for (let i = 0; i < pattern.length; i++) {
                    let reverse = Object.fromEntries(Object.entries(emojis).map(([key, value]) => [value, key]))
                    input.value = input.value.replaceAll(pattern[i], ` :${reverse[pattern[i]]}:`)
                }
            }

            document.body.addEventListener('input', ({ target }) => reverseParseEmoji(target))

            function parseEmoji() {
                let pattern = []

                findAll(/:[A-Za-z0-9+(_|)[a-z]+:/s, document.body.innerHTML)
                    .forEach(patterns => pattern.push(patterns[0].replaceAll(':', '')))

                for (let i = 0; i < pattern.length; i++) {
                    replacePattern(document.body, new RegExp(`:${pattern[i]}:`, 'g'), emojis[pattern[i]] ? emojis[pattern[i]] : '�');
                }
            }

            parseEmoji()

            new MutationObserver(mutationRecords => parseEmoji())
                .observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterDataOldValue: true
                });
        })
}
