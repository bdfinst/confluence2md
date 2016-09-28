# Confluence to Markdown converter
Convert Confluence HTML export to Markdown

# Requirements
**Must have pandoc command line tool**

http://pandoc.org/installing.html

Make sure it was installed properly by doing `pandoc --version`

# Usage
Run
- `coffee src/index.coffee` in directory with extracted files OR  
- `coffee src/index.coffee <htmlFilesDirectory> <attachmentsExportPath> <markdownImageReference>`
  
## Defaults
* `<htmlFilesDirectory>` : `Current Working Directory`
* `<attachmentsExportPath>` : `"/public/assets/images/"` Where to export images
* `<markdownImageReference>` : `"assets/images/"` Image reference in markdown files

## Export to HTML
Note that if the converter does not know how to handle a style, HTML to Markdown typically just leaves the HTML untouched (Markdown does allow for HTML tags).

## Step by step guide for Confluence data export
1. Go to the space and choose `Space tools > Content Tools on the sidebar`. 
2. Choose Export. This option will only be visible if you have the **Export Space** permission.
3. Select HTML then choose Next.
4. Decide whether you need to customise the export:
   1. Select Normal Export to produce an HTML file containing all the pages that you have permission to view.
   2. Select Custom Export if you want to export a subset of pages, or to exclude comments from the export. 
5. Extract zip

# Attribution
Thanks to Eric White for a starting point.
