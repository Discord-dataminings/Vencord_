/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Menu, Toasts, Clipboard } from "@webpack/common";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { showToast } from "@webpack/common";

interface Emoji {
    type: string;
    id: string;
    name: string;
}

interface Target {
    dataset: Emoji;
    firstChild: HTMLImageElement;
}

function removeCountingPostfix(name: string): string {
    return name.replace(/~\d+$/, "");
}

function getEmojiFormattedString(target: Target): string {
    const { dataset } = target;

    if (!dataset.id) {
        const fiberKey = Object.keys(target).find((key) =>
            /^__reactFiber\$\S+$/gm.test(key)
        );

        if (!fiberKey) return `:${dataset.name}:`;

        const emojiUnicode =
            target[fiberKey]?.child?.memoizedProps?.emoji?.surrogates;

        return emojiUnicode || `:${dataset.name}:`;
    }

    const extension = target?.firstChild.src.match(
        /https:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(\w+)/
    )?.[1];

    const emojiName = removeCountingPostfix(dataset.name);
    const emojiId = dataset.id;

    return extension === "gif"
        ? `<a:${emojiName}:${emojiId}>`
        : `<:${emojiName}:${emojiId}>`;
}

export default definePlugin({
    name: "Copy Emoji As Formatted String",
    description: "Add's button to copy emoji as formatted string!",
    authors: [Devs.HAPPY_ENDERMAN, Devs.VISHNYA_NET_CHERESHNYA],
    contextMenus: {
        "expression-picker"(children, { target }: { target: Target }) {
            if (target.dataset.type !== "emoji") return;

            children.push(
                <Menu.MenuItem
                    id="copy-formatted-string"
                    key="copy-formatted-string"
                    label={`Copy as formatted string`}
                    action={() => {
                        Clipboard.copy(getEmojiFormattedString(target));
                        showToast(
                            "Success! Copied to clipboard as formatted string.",
                            Toasts.Type.SUCCESS
                        );
                    }}
                />
            );
        },
    },
});