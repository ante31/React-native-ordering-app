export const rebuildSelectedExtras = (selectedExtras: any, extrasList: any) => {
  const updatedExtras: any = {};
  console.log("Rebuilding selected extras. Input:", selectedExtras, "Extras list:", extrasList);

  for (const key of Object.keys(selectedExtras)) {

    if (key in extrasList) {
      updatedExtras[key] = extrasList[key];
    }

  }
  console.log("Rebuilt selected extras:", updatedExtras);

  return updatedExtras;
};